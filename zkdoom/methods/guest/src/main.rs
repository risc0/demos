// Copyright 2024 RISC Zero, Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

#![no_main]

risc0_zkvm::guest::entry!(main);

use puredoom_rs::{
    doom_get_framebuffer, doom_init, doom_set_exit, doom_set_file_io, doom_set_getenv,
    doom_set_gettime, doom_set_malloc, doom_set_print, doom_update,
};
use risc0_zkvm::guest::env;
use std::alloc::{alloc, handle_alloc_error, Layout};
use std::collections::HashMap;
use std::ffi::{c_char, c_int, c_void, CStr, CString};
use std::sync::{Mutex, OnceLock};
use zkdoom_common::{FrameMode, InputData, OutputData};

#[no_mangle]
#[allow(unused_variables)]
unsafe extern "C" fn zkvm_doom_print(msg_raw: *const c_char) {
    #[cfg(feature = "zkvm_dev_mode")]
    {
        let msg = CStr::from_ptr(msg_raw)
            .to_str()
            .expect("invalid filename ptr");
        print!("{msg}");
    }
}

#[no_mangle]
unsafe extern "C" fn zkvm_doom_malloc(size: c_int) -> *mut c_void {
    let size = size as usize;
    let layout =
        Layout::from_size_align(size, 4).expect("unable to allocator more memory in doom_malloc");
    let ptr = alloc(layout);

    // println!("--ZKVM-- malloc({size:x}) -> {ptr:p}");

    if ptr.is_null() {
        handle_alloc_error(layout);
    }

    ptr as *mut c_void
}

#[no_mangle]
extern "C" fn zkvm_doom_free(_ptr: *mut c_void) {
    // println!("--ZKVM-- free({ptr:?})");
    // Current allocator doesn't free so we noop it
}

#[no_mangle]
unsafe extern "C" fn zkvm_doom_getenv(var: *const c_char) -> *mut c_char {
    let var = CStr::from_ptr(var)
        .to_str()
        .expect("invalid getenv pointer");
    // println!("--ZKVM-- getenv({var:?})");

    let value = match var {
        "HOME" => Some("/home/root"),
        // "DOOMWADDIR" => Some("/wads"),
        _ => {
            // println!("UNKNOWN env var: {}", var);
            None
        }
    };

    // Return *NULL if not known
    let value = if let Some(val) = value {
        val
    } else {
        return std::ptr::null_mut();
    };

    CString::new(value)
        .expect("Failed to convert str to CString")
        .into_raw()
}

#[no_mangle]
extern "C" fn zkvm_doom_exit(code: c_int) {
    println!("--ZKVM-- exit({code})");
    let mut game = GAME.get().unwrap().lock().expect("Failed to get GAME lock");
    if game.frame_mode == FrameMode::Last {
        game.capture_frame();
    }
    game.finalize();
    env::exit(code as u8);
}

static mut GAME_TIME_USECS: u32 = 0;

#[no_mangle]
unsafe extern "C" fn zkvm_doom_gettime(sec: *mut c_int, usec: *mut c_int) {
    *sec = (GAME_TIME_USECS / 1000000) as c_int;
    *usec = GAME_TIME_USECS as c_int;
    // println!("--ZKVM-- gettime({}, {})", *sec, *usec);
}

//--- File system operations:
pub struct File {
    pub name: String,
    pub contents: Vec<u8>,
    pub loc: usize,
}
pub struct Fs {
    files: HashMap<String, File>,
}
impl Default for Fs {
    fn default() -> Self {
        Self::new()
    }
}
impl Fs {
    pub fn new() -> Self {
        Self {
            files: HashMap::new(),
        }
    }

    pub fn add_file(&mut self, path: &str, data: &[u8]) {
        self.files.insert(
            path.to_string(),
            File {
                name: path.to_string(),
                contents: data.to_vec(),
                loc: 0,
            },
        );
    }

    pub fn open(&mut self, path: &str) -> Option<&mut File> {
        if let Some(file) = self.files.get_mut(path) {
            file.loc = 0;
            Some(file)
        } else {
            None
        }
    }
}

fn fs() -> &'static Mutex<Fs> {
    static FS: OnceLock<Mutex<Fs>> = OnceLock::new();
    FS.get_or_init(|| Mutex::new(Fs::new()))
}

#[no_mangle]
unsafe extern "C" fn zkvm_doom_open(filename: *const c_char, _mode: *const c_char) -> *mut c_void {
    let filename = CStr::from_ptr(filename)
        .to_str()
        .expect("invalid filename ptr");

    // let mode = CStr::from_ptr(mode).to_str().unwrap();
    // println!(
    //     "--ZKVM-- open({}, {})
    // ",
    //     filename, mode
    // );

    let mut fs = fs().lock().expect("Failed to get FS lock");

    if let Some(file) = fs.open(filename) {
        // cursed
        file as *mut _ as *mut c_void
    } else {
        std::ptr::null_mut()
    }
}

#[no_mangle]
unsafe extern "C" fn zkvm_doom_close(handle: *mut c_void) {
    let file: &mut File = &mut *(handle as *mut File);
    // println!("--ZKVM-- close({},...)", file.name);
    file.loc = 0;
}

#[no_mangle]
unsafe extern "C" fn zkvm_doom_read(handle: *mut c_void, buf: *mut c_void, count: c_int) -> c_int {
    let file: &mut File = &mut *(handle as *mut File);
    let copy_size = std::cmp::min(file.contents.len() - file.loc, count as usize);

    std::ptr::copy_nonoverlapping(
        file.contents[file.loc..].as_ptr(),
        buf as *mut u8,
        copy_size,
    );
    file.loc += copy_size;

    // println!(
    //     "--ZKVM-- read({}, PTR, {}) -> {}",
    //     file.name, count, copy_size
    // );

    copy_size as c_int
}

#[no_mangle]
unsafe extern "C" fn zkvm_doom_write(
    handle: *mut c_void,
    buf: *const c_void,
    count: c_int,
) -> c_int {
    let file: &mut File = &mut *(handle as *mut File);
    let copy_size = std::cmp::min(file.contents.len() - file.loc, count as usize);

    std::ptr::copy_nonoverlapping(
        buf,
        file.contents[file.loc..].as_mut_ptr() as *mut c_void,
        copy_size,
    );
    file.loc += copy_size;

    // println!(
    //     "--ZKVM-- read({}, PTR, {}) -> {}",
    //     file.name, count, copy_size
    // );

    copy_size as c_int
}

#[no_mangle]
unsafe extern "C" fn zkvm_doom_seek(
    handle: *mut c_void,
    offset: c_int,
    origin: puredoom_rs::doom_seek_t,
) -> c_int {
    let file: &mut File = &mut *(handle as *mut File);

    let ret = match origin {
        puredoom_rs::doom_seek_t_DOOM_SEEK_SET => {
            if offset as usize > file.contents.len() {
                -1
            } else {
                file.loc = offset as usize;
                file.loc as c_int
            }
        }
        puredoom_rs::doom_seek_t_DOOM_SEEK_CUR => {
            if file.loc + offset as usize > file.contents.len() {
                -1
            } else {
                file.loc += offset as usize;
                file.loc as c_int
            }
        }
        puredoom_rs::doom_seek_t_DOOM_SEEK_END => {
            file.loc = file.contents.len();
            file.loc as c_int
        }
        _ => {
            println!("ZKVM_BUG: Unknown seek origin: {}", origin);
            -1
        }
    };

    // println!(
    //     "--ZKVM-- seek({}, {}, {}) -> {}",
    //     file.name, offset, origin, ret
    // );

    ret as c_int
}

#[no_mangle]
unsafe extern "C" fn zkvm_doom_tell(handle: *mut c_void) -> c_int {
    let file: &mut File = &mut *(handle as *mut File);
    file.loc as c_int
}

#[no_mangle]
unsafe extern "C" fn zkvm_doom_eof(handle: *mut c_void) -> c_int {
    let file: &mut File = &mut *(handle as *mut File);

    if file.loc == file.contents.len() {
        1
    } else {
        0
    }
}

#[derive(Debug)]
pub struct GameMonitor {
    pub frames: Vec<Vec<u8>>,
    pub gametics: u32,
    pub frame_mode: FrameMode,
}

impl GameMonitor {
    fn new(frame_mode: FrameMode) -> Self {
        Self {
            frames: vec![],
            gametics: 0,
            frame_mode,
        }
    }
    fn capture_frame(&mut self) {
        let channels: usize = 3;
        unsafe {
            let buff = doom_get_framebuffer(channels as c_int);
            self.frames.push(
                std::slice::from_raw_parts(
                    buff,
                    channels
                        * puredoom_rs::SCREENWIDTH as usize
                        * puredoom_rs::SCREENHEIGHT as usize,
                )
                .to_vec(),
            )
        }
    }

    fn finalize(&mut self) {
        unsafe {
            let output = OutputData {
                frames: std::mem::take(&mut self.frames),
                gametics: puredoom_rs::gametic as u32,
            };
            env::commit(&output);
        }
    }
}

static GAME: OnceLock<Mutex<GameMonitor>> = OnceLock::new();

fn main() {
    let input: InputData = env::read();

    let mut argv = vec!["doom", "-file", "/wads/doom1.wad", "-timedemo", "demo"];
    if input.frame_mode == FrameMode::None {
        // Disable rendering if we are not saving any frames
        argv.push("-nodraw");
        argv.push("-noblit");
    }

    let argc_raw = argv.len().try_into().expect("Failed to convert argv len");
    let mut converted: Vec<*mut c_char> = argv
        .into_iter()
        .map(|x| {
            CString::new(x)
                .expect("Invalid argv str pointer")
                .into_raw()
        })
        .collect();
    let converted = converted.as_mut_ptr();

    // Initialized the FS
    {
        let mut fs = fs().lock().expect("Failed to get FS lock");
        fs.add_file("/wads/doom1.wad", puredoom_rs::DOOM_WAD);
        fs.add_file("demo.lmp", &input.lmp_data);
    }

    let frame_mode = input.frame_mode;

    GAME.set(Mutex::new(GameMonitor::new(frame_mode)))
        .expect("Failed to set GAME global");

    unsafe {
        // init functions
        doom_set_print(Some(zkvm_doom_print));
        doom_set_malloc(Some(zkvm_doom_malloc), Some(zkvm_doom_free));
        doom_set_getenv(Some(zkvm_doom_getenv));
        doom_set_exit(Some(zkvm_doom_exit));
        doom_set_gettime(Some(zkvm_doom_gettime));
        doom_set_file_io(
            Some(zkvm_doom_open),
            Some(zkvm_doom_close),
            Some(zkvm_doom_read),
            Some(zkvm_doom_write),
            Some(zkvm_doom_seek),
            Some(zkvm_doom_tell),
            Some(zkvm_doom_eof),
        );

        // initialize doom
        doom_init(
            argc_raw,
            converted,
            puredoom_rs::DOOM_FLAG_MENU_DARKEN_BG as i32,
        );

        // start game loop
        for i in 0..input.update_calls {
            #[cfg(feature = "zkvm_dev_mode")]
            {
                env::log(&format!(
                    "zkvm-step: {i} gametics: {}",
                    puredoom_rs::gametic
                ));
            }
            doom_update();

            if let FrameMode::Many(n) = frame_mode {
                if i % n == 0 {
                    GAME.get()
                        .unwrap()
                        .lock()
                        .expect("Failed to get GAME lock")
                        .capture_frame();
                }
            }

            GAME_TIME_USECS += 100_000;
        }

        let mut game = GAME.get().unwrap().lock().expect("Failed to get GAME lock");
        if let FrameMode::Last = frame_mode {
            game.capture_frame();
        }

        game.finalize();
    }
}
