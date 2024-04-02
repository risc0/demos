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

import {RiscZeroCheats} from "risc0/RiscZeroCheats.sol";
import {console2} from "forge-std/console2.sol";
import {Test} from "forge-std/Test.sol";
import {IRiscZeroVerifier} from "risc0/IRiscZeroVerifier.sol";
import {EvenNumber} from "../contracts/EvenNumber.sol";
import {Elf} from "./Elf.sol"; // auto-generated contract after running `cargo build`.

contract EvenNumberTest is RiscZeroCheats, Test {
    EvenNumber public evenNumber;

    address public alice = makeAddr("alice");
    address public bob = makeAddr("bob");
    address public charlie = makeAddr("charlie");

    struct Input {
        uint256 id_provider;
        string jwt;
    }

    function setUp() public {
        IRiscZeroVerifier verifier = deployRiscZeroVerifier();
        evenNumber = new EvenNumber(verifier);

        // fund alice and bob and charlie
        vm.deal(alice, 5 ether);
        vm.deal(bob, 5 ether);
        vm.deal(charlie, 5 ether);
    }

    function test_Deposit() public payable {
        bytes32 claimId = sha256(abi.encodePacked("bob@email.com"));
        vm.prank(alice);
        evenNumber.deposit{value: 1 ether}(claimId);

        assertEq(address(evenNumber).balance, 1 ether);
    }

    function test_Withdraw() public {
        // deposit as alice
        bytes32 claimId = sha256(abi.encodePacked("bob@email.com"));
        vm.prank(alice);
        evenNumber.deposit{value: 1 ether}(claimId);
        assertEq(address(evenNumber).balance, 1 ether);
        assertEq(alice.balance, 4 ether);

        // claim as bob
        string memory jwt =
            "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6Ijg3OTJlN2MyYTJiN2MxYWI5MjRlMTU4YTRlYzRjZjUxIn0.eyJlbWFpbCI6ImJvYkBlbWFpbC5jb20iLCJub25jZSI6IjB4MUQ5NkYyZjZCZUYxMjAyRTRDZTFGZjZEYWQwYzJDQjAwMjg2MWQzZSJ9.Ad3Hr5SOo0uDQ-uOldnXVhlkJIClfWJE6UsnWWDTgFNGEYqAYpbqIqPSrUIMPMy9ZHZhnQGJJcED0krQTlys5UfN6K9THo-CnIa72EhHWtALJC3XcuaFZ-iNCbFYQtaL6M7Bu4NtdlllcsUYU9V3Q2h6xOGlMjGmwOr0xQjwnI-qpny5ctzlAjGsa4E9Y2_Hu_iBQ483Yv01g31H34efGamPf8rqBDXtHobsX2W7FGYnOWLLP4nZD8obn3g-6ny5joIlx3IklAE0t7M5E98kNVKc5P7_J7e3LdEQ-0AzYcBvPvx3F29kyYa4mevPTulU2kxtCKue8EMFu7nFE0VZHQ";
        uint256 id_provider = 1;

        Input memory input = Input({id_provider: id_provider, jwt: jwt});

        (bytes memory journal, bytes32 post_state_digest, bytes memory seal) =
            prove(Elf.IS_EVEN_PATH, abi.encode(input));

        vm.prank(bob);
        evenNumber.claim(payable(bob), claimId, post_state_digest, seal);
        assertEq(address(evenNumber).balance, 0);
        assertEq(bob.balance, 6 ether);
    }
}
