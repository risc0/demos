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

        uint256 tokenId = 1; // Assuming the first minted token has ID 0
        assertEq(zid.ownerOf(tokenId), alice, "Alice should own the minted token");

        assertEq(zid.tokenURI(tokenId), "TEST", "Token URI should be 'TEST'");
    }

    function test_Burn() public {
        Types.Proof memory proof =
            Types.Proof({seal: "0x4141", postStateDigest: bytes32(0x0), journal: abi.encode(alice)});

        vm.prank(alice);
        zid.mint(abi.encode(proof), "TEST");

        uint256 tokenId = 1; // Assuming the first minted token has ID 0
        assertEq(zid.ownerOf(tokenId), alice, "Alice should own the minted token");

        vm.prank(alice);
        zid.burn(tokenId);

        assertEq(zid.balanceOf(alice), 0, "Alice should not own any tokens");
    }

    function testFail_tokenTransfer() public {
        // should fail to transfer token to any address
        Types.Proof memory proof =
            Types.Proof({seal: "0x4141", postStateDigest: bytes32(0x0), journal: abi.encode(alice)});
        vm.prank(alice);
        zid.mint(abi.encode(proof), "TEST");

        uint256 tokenId = 1; // Assuming the first minted token has ID 0
        assertEq(zid.ownerOf(tokenId), alice, "Alice should own the minted token");

        vm.prank(alice);
        zid.transferFrom(alice, bob, tokenId);
    }

    function testFail_safeTransferFrom() public {
        // should fail to transfer token to any address
        Types.Proof memory proof =
            Types.Proof({seal: "0x4141", postStateDigest: bytes32(0x0), journal: abi.encode(alice)});
        vm.prank(alice);
        zid.mint(abi.encode(proof), "TEST");

        uint256 tokenId = 0; // Assuming the first minted token has ID 0
        assertEq(zid.ownerOf(tokenId), alice, "Alice should own the minted token");

        vm.prank(alice);
        zid.safeTransferFrom(alice, bob, tokenId);
    }

    function testFail_doubleMint() public {
        Types.Proof memory proof =
            Types.Proof({seal: "0x4141", postStateDigest: bytes32(0x0), journal: abi.encode(alice)});
        vm.prank(alice);
        zid.mint(abi.encode(proof), "TEST");

        uint256 tokenId = 0; // Assuming the first minted token has ID 0
        assertEq(zid.ownerOf(tokenId), alice, "Alice should own the minted token");

        vm.prank(alice);
        zid.mint(abi.encode(proof), "TEST");
    }

    function test_mintBurnMint() public {
        Types.Proof memory proof =
            Types.Proof({seal: "0x4141", postStateDigest: bytes32(0x0), journal: abi.encode(alice)});
        vm.prank(alice);
        zid.mint(abi.encode(proof), "TEST");

        uint256 tokenId = 1; // Assuming the first minted token has ID 0
        assertEq(zid.ownerOf(tokenId), alice, "Alice should own the minted token");

        vm.prank(alice);
        zid.burn(tokenId);

        assertEq(zid.balanceOf(alice), 0, "Alice should not own any tokens");

        vm.prank(alice);
        zid.mint(abi.encode(proof), "TEST");
        assertEq(zid.ownerOf(2), alice, "Alice should own the minted token");
    }

    function testFail_burnNonExistentToken() public {
        zid.burn(1);
    }

    function testFail_burnNonOwnedToken() public {
        Types.Proof memory proof =
            Types.Proof({seal: "0x4141", postStateDigest: bytes32(0x0), journal: abi.encode(alice)});
        vm.prank(alice);
        zid.mint(abi.encode(proof), "TEST");

        uint256 tokenId = 1; // Assuming the first minted token has ID 0
        assertEq(zid.ownerOf(tokenId), alice, "Alice should own the minted token");

        vm.prank(bob);
        zid.burn(tokenId);
    }

    function testFail_mintNotProofOwner() public {
        Types.Proof memory proof =
            Types.Proof({seal: "0x4141", postStateDigest: bytes32(0x0), journal: abi.encode(alice)});
        vm.prank(bob);
        zid.mint(abi.encode(proof), "TEST");
    }

    function test_getProof() public {
        Types.Proof memory proof =
            Types.Proof({seal: "0x4141", postStateDigest: bytes32(0x0), journal: abi.encode(alice)});
        vm.prank(alice);
        zid.mint(abi.encode(proof), "TEST");

        Types.Proof memory proof2 = zid.getProof(1);
        assertEq(proof2.seal, proof.seal, "Seal should be equal");
        assertEq(proof2.postStateDigest, proof.postStateDigest, "Post state digest should be equal");
        assertEq(proof2.journal, proof.journal, "Journal should be equal");
    }
}
