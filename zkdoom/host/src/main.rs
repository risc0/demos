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

use bonsai_sdk::alpha as bonsai_sdk;
use clap::Parser;
use image::{Rgb, RgbImage};
use risc0_zkvm::{
    compute_image_id, serde::to_vec, ExecutorEnv, ExecutorImpl, Receipt, Segment, SegmentRef,
};
use serde::{Deserialize, Serialize};
use std::path::Path;
use std::time::Duration;
use zkdoom_common::{FrameMode, InputData, OutputData};

const NULL_SEGMENT_REF: NullSegmentRef = NullSegmentRef {};
#[derive(Serialize, Deserialize)]
struct NullSegmentRef {}

#[typetag::serde]
impl SegmentRef for NullSegmentRef {
    fn resolve(&self) -> anyhow::Result<Segment> {
        unimplemented!()
    }
}

/// zkDOOM host cli
#[derive(Parser, Debug)]
#[command(version, about, long_about = None)]
struct Args {
    /// ZKVM Guest elf file
    #[arg(short, long)]
    pub elf_file: String,

    /// Optional directory to write out frame jpg's to
    #[arg(short, long)]
    pub frame_dir: Option<String>,

    /// Frame commitment mode
    /// 0 = last frame
    /// N = every N frames
    /// -1 = No frames are committed
    #[arg(short = 'p', long, default_value_t = 1)]
    pub frame_mode: i32,

    /// Number of calls to make to the doom_update() function
    #[arg(short, long, default_value_t = 5)]
    pub update_calls: u32,

    /// Demo file input
    #[arg(short, long)]
    pub demo_file: String,

    /// Enable bonsai proving
    #[arg(short, long)]
    pub bonsai: bool,
}

fn prove_bonsai(input: InputData, elf: &[u8]) -> Receipt {
    let client = bonsai_sdk::Client::from_env(risc0_zkvm::VERSION)
        .expect("Failed to initialize bonsai client from env vars");

    let image_id = compute_image_id(elf).expect("Failed to compute image ID");
    let image_id_hex = hex::encode(image_id);
    client
        .upload_img(&image_id_hex, elf.to_vec())
        .expect("Failed to upload image");

    let input_data = to_vec(&input).unwrap();
    let input_data = bytemuck::cast_slice(&input_data).to_vec();
    let input_id = client
        .upload_input(input_data)
        .expect("Failed to upload input");

    let session = client
        .create_session(image_id_hex, input_id, vec![])
        .expect("Failed to start session");

    loop {
        let res = session.status(&client).expect("Failed to get status");
        if res.status == "RUNNING" {
            tracing::info!(
                "Current status: {} - state: {} - continue polling...",
                res.status,
                res.state.unwrap_or_default()
            );
            std::thread::sleep(Duration::from_secs(15));
            continue;
        }
        if res.status == "SUCCEEDED" {
            // Download the receipt, containing the output
            let receipt_url = res
                .receipt_url
                .expect("API error, missing receipt on completed session");

            let receipt_buf = client
                .download(&receipt_url)
                .expect("Failed to download receipt");
            let receipt: Receipt =
                bincode::deserialize(&receipt_buf).expect("Failed to deserialize receipt");
            receipt.verify(image_id).expect("Failed to verify receipt");
            return receipt;
        } else {
            panic!(
                "Workflow exited: {} - | err: {}",
                res.status,
                res.error_msg.unwrap_or_default()
            );
        }
    }
}

fn main() {
    tracing_subscriber::fmt()
        .with_env_filter(tracing_subscriber::filter::EnvFilter::from_default_env())
        .init();

    let args = Args::parse();
    let elf_file = Path::new(&args.elf_file);
    if !elf_file.exists() {
        tracing::error!("Failed to find elf_file input: {}", args.elf_file);
        return;
    }
    let elf = std::fs::read(elf_file).expect("Failed to read elf file");

    let demo_file = Path::new(&args.demo_file);
    if !demo_file.exists() {
        tracing::error!("Failed to find demo_file input: {}", args.elf_file);
        return;
    }
    let demo = std::fs::read(demo_file).expect("Failed to demo file");

    let frame_mode = match args.frame_mode {
        -1 => FrameMode::None,
        0 => FrameMode::Last,
        y => FrameMode::Many(y as u32),
    };

    if args.update_calls < 2 {
        tracing::error!("update_calls (-u) must be >= 2");
        return;
    }

    let input = InputData {
        lmp_data: demo,
        update_calls: args.update_calls,
        frame_mode,
    };

    let env = ExecutorEnv::builder()
        .write(&input)
        .unwrap()
        .build()
        .unwrap();

    let output: OutputData = if args.bonsai {
        let receipt = prove_bonsai(input, &elf);
        receipt.journal.decode().expect("Cloud not decode journal")
    } else {
        let mut exec = ExecutorImpl::from_elf(env, &elf).unwrap();
        let session = exec
            .run_with_callback(|_| Ok(Box::new(NULL_SEGMENT_REF)))
            .unwrap();
        let journal = session.journal.unwrap();
        let output: OutputData = journal.decode().expect("Could not decode journal");
        tracing::info!(
            "Completed {} updates in {} gametics. cycles/gametics: {}",
            args.update_calls,
            output.gametics,
            session.total_cycles / output.gametics as u64,
        );

        output
    };

    if let Some(frame_dir) = args.frame_dir {
        let out_dir = Path::new(&frame_dir);
        let channels = 3;

        for (idx, frame) in output.frames.iter().enumerate() {
            let mut img = RgbImage::new(puredoom_rs::SCREENWIDTH, puredoom_rs::SCREENHEIGHT);
            let src_pitch = puredoom_rs::SCREENWIDTH * channels;

            for y in 0..puredoom_rs::SCREENHEIGHT {
                for x in 0..puredoom_rs::SCREENWIDTH {
                    let srck = (y * src_pitch + x * channels) as usize;
                    let r = frame[srck];
                    let g = frame[srck + 1];
                    let b = frame[srck + 2];

                    img.put_pixel(x, y, Rgb([r, g, b]));
                }
            }
            let path = out_dir.join(format!("frame{idx}.jpg"));
            img.save(path).expect("Failed to save frame image");
        }
    }
}
