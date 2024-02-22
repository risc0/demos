# zkDOOM

> WARNING: this project is experimental and should not be used for any production use cases. Use at your own risk.

## WAD files

You will need to buy and extra the doom.wad from a full copy, or use the shareware doom1.wad from https://doomwiki.org/wiki/DOOM1.WAD

and place it into `puredoom-rs/` dir.

## Dependencies

For macOS, install LLVM and ImageMagick using the following command for homebrew:

```bash
brew install imagemagick llvm
```

This will install a version of clang that supports RISC-V targets.

## Run

Run the zkDOOM system with a input demo file (lmp), emit the frames to /tmp/ and run for 30 update iterations

Please have `CC` set to clang, currently we don't support building this project with gcc
```bash
export CC=clang
```

For macOS, use the version of clang that was installed by the homebrew command:
```bash
export CC=/opt/homebrew/opt/llvm/bin/clang
```

Run it:

```bash
RUST_LOG=info cargo run --release -- -e ./target/riscv-guest/riscv32im-risc0-zkvm-elf/release/doom -d ./e1m5sec.lmp -f /tmp -u 30
```

### Perf mode

The `puredoom-rs` crate has a feature `zkvm_dev_mode` which optimizes the doom source for best zkvm cycle perf. It can be toggled in the `methods/guest/Cargo.toml` file.

### Frames to gif

```bash
convert -delay 20 -loop 0 `ls -v /tmp/frame*.jpg` /tmp/zkdoom.gif
```

## Demo files can be found:

https://classicdoom.com/d1demos.htm#e1m5

WARNING: You need to make sure your demo files match the contents of the WAD. So the doom1.wad shareware version only contains a limited few maps so only select demos will work.
