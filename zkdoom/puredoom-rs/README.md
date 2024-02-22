# puredoom-rs

Rust bindgen wrapper around https://github.com/Daivuk/PureDOOM

## Patches

Updating the patch:
1. cd into the `out/` dir inside of the target dir (full path printed in the build.rs)
2. make updates to `puredoom_patched.h`
3. `diff -Naur ./puredoom.h ./puredoom_patched.h > PATH/TO/puredoom-rs/zkvm-doom.patch`

### namelist patch

The `*(int *)` cast causes a unaligned memory load in the zkvm so we found a work around from: https://github.com/ilyakurdyukov/fpdoom/blob/main/doom.patch#L2799C3-L2799C46


### -playdemo / -timedemo bugged

Because these two modes still called `D_DoomLoop()` it would double render the menu / fade screen and bug out the main game view port. Removed these to enable control of game loop via `doom_update()`

### ifdef ZKVM_DEV_MODE

Its possible to customize the game depending this var in order to make change to improve the games perf in the zkvm. Currently unused in the patch file.

### I_Error in timedemo

We patched out the I_Error() call in G_CheckDemoStatus when running a time demo to allow for -timedemo + -nodraw to still exit cleanly and wrapup the zkvm work correctly.