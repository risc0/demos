// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.21;

import {Test, console2} from "forge-std/Test.sol";
import {ERC20} from "openzeppelin/token/ERC20/ERC20.sol";
import {Seal} from "../src/risczero/RiscZeroGroth16Verifier.sol";
import {MockVerifier} from "../src/risczero/MockVerifier.sol";
import {ZID} from "../src/ZID.sol";
import {Errors, Events, Types} from "../src/ZIDLibs.sol";

contract ZIDTest is Test {
    ZID internal zid;
    ERC20 internal dai;

    bytes BOB_IDENT = bytes("bob@example.com");
    bytes ALICE_IDENT = bytes("alice@example.com");
    bytes MALICE_IDENT = bytes("malice@example.com");

    address alice = makeAddr("alice@example.com");
    address bob = makeAddr("bob@example.com");
    address carl = makeAddr("carl@example.com");
    address whale = makeAddr("whale@example.com");
    address malice = makeAddr("malice@example.com");

    uint256 public constant CONTROL_ID_0 = 0x0;
    uint256 public constant CONTROL_ID_1 = 0x1;

    bytes32 internal constant IMAGE_ID = bytes32(0x0);

    function setUp() public {
        // Use mock verifier
        MockVerifier verifier = new MockVerifier(CONTROL_ID_0, CONTROL_ID_1);
        zid = new ZID(verifier, IMAGE_ID);
        dai = new ERC20("Dai Stablecoin", "DAI");
        deal({to: bob, give: 5 ether});
        deal({token: address(dai), to: bob, give: 1_000_000e18});
        deal({to: carl, give: 5 ether});
        deal({token: address(dai), to: carl, give: 1_000_000e18});
        deal({to: malice, give: 1 ether});

        deal({to: whale, give: 100 ether});
    }

    function rollForward() public {
        vm.roll(block.number + 1);
    }

    // Valid Mint
    function test_Mint() public {
        Types.Proof memory proof =
            Types.Proof({seal: "0x4141", postStateDigest: bytes32(0x0), journal: abi.encode(alice)});

        vm.prank(alice);
        zid.mint(abi.encode(proof), "TEST");

        uint256 tokenId = 0; // Assuming the first minted token has ID 0
        assertEq(zid.ownerOf(tokenId), alice, "Alice should own the minted token");

        assertEq(zid.tokenURI(tokenId), "TEST", "Token URI should be 'TEST'");
    }
}
