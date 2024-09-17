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
//
// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.20;

import {RiscZeroCheats} from "risc0-test/RiscZeroCheats.sol";
import {console2} from "forge-std/console2.sol";
import {Test} from "forge-std/Test.sol";
import {IRiscZeroVerifier} from "risc0/IRiscZeroVerifier.sol";
import {zkKYC} from "../contracts/zkKYC.sol";
import {Elf} from "./Elf.sol"; // auto-generated contract after running `cargo build`.

contract EvenNumberTest is RiscZeroCheats, Test {
    zkKYC public kyc;

    address alice = makeAddr("alice");
    address bob = makeAddr("bob");

    struct Input {
        uint256 id_provider;
        string jwt;
    }

    function setUp() public {
        IRiscZeroVerifier verifier = deployRiscZeroVerifier();
        kyc = new zkKYC(verifier, "TEST", "TST");
    }

    function test_Mint() public {
        string memory jwt =
            "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6Ijg3OTJlN2MyYTJiN2MxYWI5MjRlMTU4YTRlYzRjZjUxIn0.eyJlbWFpbCI6ImJvYkBlbWFpbC5jb20iLCJub25jZSI6IjB4MUQ5NkYyZjZCZUYxMjAyRTRDZTFGZjZEYWQwYzJDQjAwMjg2MWQzZSJ9.Ad3Hr5SOo0uDQ-uOldnXVhlkJIClfWJE6UsnWWDTgFNGEYqAYpbqIqPSrUIMPMy9ZHZhnQGJJcED0krQTlys5UfN6K9THo-CnIa72EhHWtALJC3XcuaFZ-iNCbFYQtaL6M7Bu4NtdlllcsUYU9V3Q2h6xOGlMjGmwOr0xQjwnI-qpny5ctzlAjGsa4E9Y2_Hu_iBQ483Yv01g31H34efGamPf8rqBDXtHobsX2W7FGYnOWLLP4nZD8obn3g-6ny5joIlx3IklAE0t7M5E98kNVKc5P7_J7e3LdEQ-0AzYcBvPvx3F29kyYa4mevPTulU2kxtCKue8EMFu7nFE0VZHQ";
        uint256 id_provider = 1;

        Input memory input = Input({id_provider: id_provider, jwt: jwt});

        (bytes memory journal, bytes memory seal) = prove(Elf.JWT_VALIDATOR_PATH, abi.encode(input));

        vm.prank(bob);
        kyc.mint(bob, keccak256(abi.encodePacked("test")), seal);
    }

    function testFail_TransferFrom() public {
        string memory jwt =
            "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6Ijg3OTJlN2MyYTJiN2MxYWI5MjRlMTU4YTRlYzRjZjUxIn0.eyJlbWFpbCI6ImJvYkBlbWFpbC5jb20iLCJub25jZSI6IjB4MUQ5NkYyZjZCZUYxMjAyRTRDZTFGZjZEYWQwYzJDQjAwMjg2MWQzZSJ9.Ad3Hr5SOo0uDQ-uOldnXVhlkJIClfWJE6UsnWWDTgFNGEYqAYpbqIqPSrUIMPMy9ZHZhnQGJJcED0krQTlys5UfN6K9THo-CnIa72EhHWtALJC3XcuaFZ-iNCbFYQtaL6M7Bu4NtdlllcsUYU9V3Q2h6xOGlMjGmwOr0xQjwnI-qpny5ctzlAjGsa4E9Y2_Hu_iBQ483Yv01g31H34efGamPf8rqBDXtHobsX2W7FGYnOWLLP4nZD8obn3g-6ny5joIlx3IklAE0t7M5E98kNVKc5P7_J7e3LdEQ-0AzYcBvPvx3F29kyYa4mevPTulU2kxtCKue8EMFu7nFE0VZHQ";
        uint256 id_provider = 1;

        Input memory input = Input({id_provider: id_provider, jwt: jwt});

        (bytes memory journal, bytes memory seal) = prove(Elf.JWT_VALIDATOR_PATH, abi.encode(input));

        kyc.mint(alice, keccak256(abi.encodePacked("test")), seal);

        kyc.transferFrom(alice, address(this), 0);
    }

    function test_Burn() public {
        string memory jwt =
            "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6Ijg3OTJlN2MyYTJiN2MxYWI5MjRlMTU4YTRlYzRjZjUxIn0.eyJlbWFpbCI6ImJvYkBlbWFpbC5jb20iLCJub25jZSI6IjB4MUQ5NkYyZjZCZUYxMjAyRTRDZTFGZjZEYWQwYzJDQjAwMjg2MWQzZSJ9.Ad3Hr5SOo0uDQ-uOldnXVhlkJIClfWJE6UsnWWDTgFNGEYqAYpbqIqPSrUIMPMy9ZHZhnQGJJcED0krQTlys5UfN6K9THo-CnIa72EhHWtALJC3XcuaFZ-iNCbFYQtaL6M7Bu4NtdlllcsUYU9V3Q2h6xOGlMjGmwOr0xQjwnI-qpny5ctzlAjGsa4E9Y2_Hu_iBQ483Yv01g31H34efGamPf8rqBDXtHobsX2W7FGYnOWLLP4nZD8obn3g-6ny5joIlx3IklAE0t7M5E98kNVKc5P7_J7e3LdEQ-0AzYcBvPvx3F29kyYa4mevPTulU2kxtCKue8EMFu7nFE0VZHQ";
        uint256 id_provider = 1;

        Input memory input = Input({id_provider: id_provider, jwt: jwt});

        (bytes memory journal, bytes memory seal) = prove(Elf.JWT_VALIDATOR_PATH, abi.encode(input));

        kyc.mint(alice, keccak256(abi.encodePacked("test")), seal);

        vm.prank(alice);
        kyc.burn(uint256(keccak256(abi.encodePacked("test"))));
    }

    function testFail_Approve() public {
        string memory jwt =
            "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6Ijg3OTJlN2MyYTJiN2MxYWI5MjRlMTU4YTRlYzRjZjUxIn0.eyJlbWFpbCI6ImJvYkBlbWFpbC5jb20iLCJub25jZSI6IjB4MUQ5NkYyZjZCZUYxMjAyRTRDZTFGZjZEYWQwYzJDQjAwMjg2MWQzZSJ9.Ad3Hr5SOo0uDQ-uOldnXVhlkJIClfWJE6UsnWWDTgFNGEYqAYpbqIqPSrUIMPMy9ZHZhnQGJJcED0krQTlys5UfN6K9THo-CnIa72EhHWtALJC3XcuaFZ-iNCbFYQtaL6M7Bu4NtdlllcsUYU9V3Q2h6xOGlMjGmwOr0xQjwnI-qpny5ctzlAjGsa4E9Y2_Hu_iBQ483Yv01g31H34efGamPf8rqBDXtHobsX2W7FGYnOWLLP4nZD8obn3g-6ny5joIlx3IklAE0t7M5E98kNVKc5P7_J7e3LdEQ-0AzYcBvPvx3F29kyYa4mevPTulU2kxtCKue8EMFu7nFE0VZHQ";
        uint256 id_provider = 1;

        Input memory input = Input({id_provider: id_provider, jwt: jwt});

        (bytes memory journal, bytes memory seal) = prove(Elf.JWT_VALIDATOR_PATH, abi.encode(input));

        kyc.mint(alice, keccak256(abi.encodePacked("test")), seal);

        vm.prank(alice);

        kyc.approve(address(this), uint256(keccak256(abi.encodePacked("test"))));
    }

    function testFail_SetApprovalForAll() public {
        string memory jwt =
            "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6Ijg3OTJlN2MyYTJiN2MxYWI5MjRlMTU4YTRlYzRjZjUxIn0.eyJlbWFpbCI6ImJvYkBlbWFpbC5jb20iLCJub25jZSI6IjB4MUQ5NkYyZjZCZUYxMjAyRTRDZTFGZjZEYWQwYzJDQjAwMjg2MWQzZSJ9.Ad3Hr5SOo0uDQ-uOldnXVhlkJIClfWJE6UsnWWDTgFNGEYqAYpbqIqPSrUIMPMy9ZHZhnQGJJcED0krQTlys5UfN6K9THo-CnIa72EhHWtALJC3XcuaFZ-iNCbFYQtaL6M7Bu4NtdlllcsUYU9V3Q2h6xOGlMjGmwOr0xQjwnI-qpny5ctzlAjGsa4E9Y2_Hu_iBQ483Yv01g31H34efGamPf8rqBDXtHobsX2W7FGYnOWLLP4nZD8obn3g-6ny5joIlx3IklAE0t7M5E98kNVKc5P7_J7e3LdEQ-0AzYcBvPvx3F29kyYa4mevPTulU2kxtCKue8EMFu7nFE0VZHQ";
        uint256 id_provider = 1;

        Input memory input = Input({id_provider: id_provider, jwt: jwt});

        (bytes memory _journal, bytes memory seal) = prove(Elf.JWT_VALIDATOR_PATH, abi.encode(input));

        kyc.mint(alice, keccak256(abi.encodePacked("test")), seal);

        vm.prank(alice);
        kyc.setApprovalForAll(address(this), true);
    }

    function testFail_SafeTransferFrom() public {
        string memory jwt =
            "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6Ijg3OTJlN2MyYTJiN2MxYWI5MjRlMTU4YTRlYzRjZjUxIn0.eyJlbWFpbCI6ImJvYkBlbWFpbC5jb20iLCJub25jZSI6IjB4MUQ5NkYyZjZCZUYxMjAyRTRDZTFGZjZEYWQwYzJDQjAwMjg2MWQzZSJ9.Ad3Hr5SOo0uDQ-uOldnXVhlkJIClfWJE6UsnWWDTgFNGEYqAYpbqIqPSrUIMPMy9ZHZhnQGJJcED0krQTlys5UfN6K9THo-CnIa72EhHWtALJC3XcuaFZ-iNCbFYQtaL6M7Bu4NtdlllcsUYU9V3Q2h6xOGlMjGmwOr0xQjwnI-qpny5ctzlAjGsa4E9Y2_Hu_iBQ483Yv01g31H34efGamPf8rqBDXtHobsX2W7FGYnOWLLP4nZD8obn3g-6ny5joIlx3IklAE0t7M5E98kNVKc5P7_J7e3LdEQ-0AzYcBvPvx3F29kyYa4mevPTulU2kxtCKue8EMFu7nFE0VZHQ";
        uint256 id_provider = 1;

        Input memory input = Input({id_provider: id_provider, jwt: jwt});

        (bytes memory journal, bytes memory seal) = prove(Elf.JWT_VALIDATOR_PATH, abi.encode(input));

        kyc.mint(alice, keccak256(abi.encodePacked("test")), seal);

        vm.prank(alice);
        kyc.safeTransferFrom(alice, bob, uint256(keccak256(abi.encodePacked("test"))), "0x");
    }

    function testFail_burnNotOwner() public {
        string memory jwt =
            "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6Ijg3OTJlN2MyYTJiN2MxYWI5MjRlMTU4YTRlYzRjZjUxIn0.eyJlbWFpbCI6ImJvYkBlbWFpbC5jb20iLCJub25jZSI6IjB4MUQ5NkYyZjZCZUYxMjAyRTRDZTFGZjZEYWQwYzJDQjAwMjg2MWQzZSJ9.Ad3Hr5SOo0uDQ-uOldnXVhlkJIClfWJE6UsnWWDTgFNGEYqAYpbqIqPSrUIMPMy9ZHZhnQGJJcED0krQTlys5UfN6K9THo-CnIa72EhHWtALJC3XcuaFZ-iNCbFYQtaL6M7Bu4NtdlllcsUYU9V3Q2h6xOGlMjGmwOr0xQjwnI-qpny5ctzlAjGsa4E9Y2_Hu_iBQ483Yv01g31H34efGamPf8rqBDXtHobsX2W7FGYnOWLLP4nZD8obn3g-6ny5joIlx3IklAE0t7M5E98kNVKc5P7_J7e3LdEQ-0AzYcBvPvx3F29kyYa4mevPTulU2kxtCKue8EMFu7nFE0VZHQ";
        uint256 id_provider = 1;

        Input memory input = Input({id_provider: id_provider, jwt: jwt});

        (bytes memory _journal, bytes memory seal) = prove(Elf.JWT_VALIDATOR_PATH, abi.encode(input));

        kyc.mint(alice, keccak256(abi.encodePacked("test")), seal);

        vm.prank(bob);
        kyc.burn(uint256(keccak256(abi.encodePacked("test"))));
    }

    function testFail_MintBadJWT() public {
        string memory jwt = "xxxx.xxxx.xxxx";
        uint256 id_provider = 1;

        Input memory input = Input({id_provider: id_provider, jwt: jwt});

        (bytes memory _journal, bytes memory seal) = prove(Elf.JWT_VALIDATOR_PATH, abi.encode(input));

        kyc.mint(msg.sender, keccak256(abi.encodePacked("test")), seal);
    }

    function testFail_MintMany() public {
        string memory jwt =
            "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6Ijg3OTJlN2MyYTJiN2MxYWI5MjRlMTU4YTRlYzRjZjUxIn0.eyJlbWFpbCI6ImJvYkBlbWFpbC5jb20iLCJub25jZSI6IjB4MUQ5NkYyZjZCZUYxMjAyRTRDZTFGZjZEYWQwYzJDQjAwMjg2MWQzZSJ9.Ad3Hr5SOo0uDQ-uOldnXVhlkJIClfWJE6UsnWWDTgFNGEYqAYpbqIqPSrUIMPMy9ZHZhnQGJJcED0krQTlys5UfN6K9THo-CnIa72EhHWtALJC3XcuaFZ-iNCbFYQtaL6M7Bu4NtdlllcsUYU9V3Q2h6xOGlMjGmwOr0xQjwnI-qpny5ctzlAjGsa4E9Y2_Hu_iBQ483Yv01g31H34efGamPf8rqBDXtHobsX2W7FGYnOWLLP4nZD8obn3g-6ny5joIlx3IklAE0t7M5E98kNVKc5P7_J7e3LdEQ-0AzYcBvPvx3F29kyYa4mevPTulU2kxtCKue8EMFu7nFE0VZHQ";
        uint256 id_provider = 1;

        Input memory input = Input({id_provider: id_provider, jwt: jwt});

        (bytes memory _journal, bytes memory seal) = prove(Elf.JWT_VALIDATOR_PATH, abi.encode(input));

        vm.prank(alice);
        kyc.mint(alice, keccak256(abi.encodePacked("test")), seal);

        vm.prank(alice);
        kyc.mint(alice, keccak256(abi.encodePacked("test_agian")), seal);
    }

    function test_MintBurnMint() public {
        string memory jwt =
            "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6Ijg3OTJlN2MyYTJiN2MxYWI5MjRlMTU4YTRlYzRjZjUxIn0.eyJlbWFpbCI6ImJvYkBlbWFpbC5jb20iLCJub25jZSI6IjB4MUQ5NkYyZjZCZUYxMjAyRTRDZTFGZjZEYWQwYzJDQjAwMjg2MWQzZSJ9.Ad3Hr5SOo0uDQ-uOldnXVhlkJIClfWJE6UsnWWDTgFNGEYqAYpbqIqPSrUIMPMy9ZHZhnQGJJcED0krQTlys5UfN6K9THo-CnIa72EhHWtALJC3XcuaFZ-iNCbFYQtaL6M7Bu4NtdlllcsUYU9V3Q2h6xOGlMjGmwOr0xQjwnI-qpny5ctzlAjGsa4E9Y2_Hu_iBQ483Yv01g31H34efGamPf8rqBDXtHobsX2W7FGYnOWLLP4nZD8obn3g-6ny5joIlx3IklAE0t7M5E98kNVKc5P7_J7e3LdEQ-0AzYcBvPvx3F29kyYa4mevPTulU2kxtCKue8EMFu7nFE0VZHQ";
        uint256 id_provider = 1;

        Input memory input = Input({id_provider: id_provider, jwt: jwt});

        (bytes memory _journal, bytes memory seal) = prove(Elf.JWT_VALIDATOR_PATH, abi.encode(input));

        vm.prank(alice);
        kyc.mint(alice, keccak256(abi.encodePacked("test")), seal);

        vm.prank(alice);
        kyc.burn(uint256(keccak256(abi.encodePacked("test"))));

        vm.prank(alice);
        kyc.mint(alice, keccak256(abi.encodePacked("test")), seal);
    }
}
