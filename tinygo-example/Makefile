ROOT_DIR:=$(strip $(dir $(realpath $(lastword $(MAKEFILE_LIST)))))

default: execute

.PHONY: platform
platform:
	cargo +risc0 rustc -p zkvm-platform --target riscv32im-risc0-zkvm-elf --lib --crate-type staticlib --release --target-dir ./guest/out/platform

.PHONY: tinygo-llvm
tinygo-llvm:
	cd tinygo; make llvm-source && make llvm-build

.PHONY: tinygo-rebuild
tinygo-rebuild:
	cd tinygo; make -j10

.PHONY: tinygo
tinygo: tinygo-llvm tinygo-rebuild

.PHONY: guest
guest: platform
    # Note: this will link against the risc0 platform static lib
	./tinygo/build/tinygo build -target=zkvm -o ./guest/out/main ./guest/main.go

.PHONY: execute
execute: guest
	RISC0_DEV_MODE=true cargo run

.PHONY: prove
prove: guest
	cargo run
