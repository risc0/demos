package main

/*
#include <stdint.h>
#cgo LDFLAGS: -L./out/platform/riscv32im-risc0-zkvm-elf/release -lzkvm_platform
#define DIGEST_WORDS 8
typedef struct Sha256_Impl Sha256_Impl;
typedef struct sha256_state {
  Sha256_Impl *inner;
} sha256_state;
typedef uint32_t Digest[DIGEST_WORDS];
struct sha256_state *init_sha256(void);
void sha256_update(struct sha256_state *hasher, const uint8_t *data, uint32_t len);
Digest *sha256_finalize(struct sha256_state *hasher);
void sha256_free(struct sha256_state *hasher);
void env_commit(struct sha256_state *hasher, const uint8_t *bytes_ptr, uint32_t len);
void env_exit(struct sha256_state *hasher, uint8_t exit_code);
*/
import "C"

func main() {
	hasher := C.init_sha256()

	// TODO replace this output with program specific output
	outputBytes := [4]byte{0, 1, 2, 3}

	C.env_commit(hasher, &outputBytes[0], uint32(len(outputBytes)))
	C.env_exit(hasher, 0)
}
