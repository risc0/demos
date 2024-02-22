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

use serde::{Deserialize, Serialize};

#[derive(Serialize, Debug, Deserialize, PartialEq, Copy, Clone)]
pub enum FrameMode {
    /// Commits the last frame to the journal
    Last,
    /// Commits every N frames
    ///
    /// eg: Many(1) == every frame
    ///     Many(4) == every 4 frames
    Many(u32),
    None,
}

#[derive(Serialize, Deserialize)]
pub struct InputData {
    pub lmp_data: Vec<u8>,
    pub update_calls: u32,
    pub frame_mode: FrameMode,
}

#[derive(Serialize, Deserialize)]
pub struct OutputData {
    pub frames: Vec<Vec<u8>>,
    pub gametics: u32,
}
