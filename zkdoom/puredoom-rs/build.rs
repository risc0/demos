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

use std::{env, fs::File, io, path::Path};

const PURE_DOOM_HEADER_URL: &str = "https://raw.githubusercontent.com/Daivuk/PureDOOM/f847278ca13e4f5624a3d4e9080a8268c86e858a/PureDOOM.h";

fn main() {
    let out_dir = env::var("OUT_DIR").unwrap();
    let out_dir = Path::new(&out_dir);
    let doom_hdr = out_dir.join("puredoom.h");
    let doom_hdr_patched = out_dir.join("puredoom_patched.h");

    if !doom_hdr.exists() {
        let resp = ureq::get(PURE_DOOM_HEADER_URL)
            .call()
            .expect("Failed to download puredoom header file");
        let mut reader = resp.into_reader();
        let mut hdr_file = File::create(&doom_hdr).expect("Failed to create header file");
        io::copy(&mut reader, &mut hdr_file).expect("Failed to write header to disk");
    }

    let mut builder = cc::Build::new();
    builder
        .file("src/sys/puredoom.c")
        .flag("-Wno-deprecated-non-prototype")
        .flag("-Wno-missing-field-initializers")
        .flag("-Wno-unused-but-set-variable")
        .flag("-Wno-unused-parameter")
        .flag("-Wno-parentheses")
        .flag("-Wno-sometimes-uninitialized")
        .flag("-Wno-sign-compare")
        .flag("-Wno-unknown-pragmas")
        .flag("-Wno-unused-but-set-parameter")
        .flag("-Wno-unused-variable")
        .flag("-falign-functions=2")
        .include(out_dir);

    let target_os = env::var("CARGO_CFG_TARGET_OS").unwrap();
    if target_os == "zkvm" {
        // Assumes CC=clang here:
        builder.flag("-target");
        builder.flag("riscv32-unknown-elf");
        // This prevents compressed instructions from being emitted
        builder.flag("-march=rv32im");
        if env::var("CARGO_FEATURE_ZKVM_DEV_MODE").is_ok() {
            println!("cargo:warning=BUILDING IN ZKVM_DEV_MODE",);
            builder.flag("-DZKVM_DEV_MODE=1");
        }

        // Apply the puredoom patch:
        let hdr_contents =
            std::fs::read_to_string(&doom_hdr).expect("Failed to read doom header file");
        let patch_contents = std::fs::read_to_string("./zkvm-doom.patch")
            .expect("Failed to read puredoom patch file");
        let patch = diffy::Patch::from_str(&patch_contents).unwrap();
        let patch_result =
            diffy::apply(&hdr_contents, &patch).expect("Failed to apply puredoom patch");

        std::fs::write(&doom_hdr_patched, patch_result).expect("Failed to rewrite doom file");
    } else {
        std::fs::copy(&doom_hdr, &doom_hdr_patched).expect("Failed to copy doom header");
    }
    builder.compile("puredoom");

    println!(
        "cargo:warning=Header file: {}",
        doom_hdr_patched.to_str().unwrap()
    );

    let mut bindgen_builder = bindgen::Builder::default()
        .header(doom_hdr_patched.to_str().unwrap())
        .parse_callbacks(Box::new(bindgen::CargoCallbacks::new()));

    if target_os == "zkvm" {
        bindgen_builder = bindgen_builder
            .clang_arg("-target")
            .clang_arg("riscv32-unknown-elf");
    }

    let bindings = bindgen_builder
        .generate()
        .expect("Unable to generate bindings");

    bindings
        .write_to_file(out_dir.join("bindings.rs"))
        .expect("Couldn't write bindings!");
}
