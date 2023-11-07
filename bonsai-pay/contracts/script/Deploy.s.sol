// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.21;

import {Script} from "forge-std/Script.sol";
import {MockVerifier} from "./../src/risczero/MockVerifier.sol";
import {RiscZeroGroth16Verifier} from "./../src/risczero/RiscZeroGroth16Verifier.sol";
import {ZRP} from "./../src/ZRP.sol";
import "forge-std/console2.sol";

contract Deploy is Script {
    RiscZeroGroth16Verifier public verifier;
    ZRP public custody;
    bytes32 public imageId;
    uint256 public controlId0;
    uint256 public controlId1;
    uint256 public deployerPrivateKey;

    function run() external {
        // Load env vars
        deployerPrivateKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        controlId0 = vm.envUint("CONTROL_ID_0");
        controlId1 = vm.envUint("CONTROL_ID_1");
        imageId = vm.envBytes32("IMAGE_ID");

        vm.startBroadcast(deployerPrivateKey);

        verifier = new RiscZeroGroth16Verifier(controlId0, controlId1);
        custody = new ZRP(verifier, imageId);

        console2.log("verifier: %s", address(verifier));
        console2.log("custody: %s", address(custody));

        vm.stopBroadcast();
    }
}
