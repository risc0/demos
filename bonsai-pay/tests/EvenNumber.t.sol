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

    function setUp() public {
        IRiscZeroVerifier verifier = deployRiscZeroVerifier();
        evenNumber = new EvenNumber(verifier);
        assertEq(evenNumber.get(), 0);

        // fund alice and bob and charlie
        vm.deal(alice, 5 ether);
        vm.deal(bob, 5 ether);
        vm.deal(charlie, 5 ether);
    }

    function test_SetEven() public {
        uint256 number = 12345678;
        (bytes memory journal, bytes32 post_state_digest, bytes memory seal) =
            prove(Elf.IS_EVEN_PATH, abi.encode(number));

        evenNumber.set(abi.decode(journal, (uint256)), post_state_digest, seal);
        assertEq(evenNumber.get(), number);
    }

    function test_SetZero() public {
        uint256 number = 0;
        (bytes memory journal, bytes32 post_state_digest, bytes memory seal) =
            prove(Elf.IS_EVEN_PATH, abi.encode(number));

        evenNumber.set(abi.decode(journal, (uint256)), post_state_digest, seal);
        assertEq(evenNumber.get(), number);
    }

    function test_Deposit() public payable {
        bytes32 claimId = sha256(abi.encodePacked("bob@email.com"));
        vm.prank(alice);
        evenNumber.deposit{value: 1 ether}(claimId);

        assertEq(address(evenNumber).balance, 1 ether);
    }

    function test_Claim() public {
        // deposit as alice
        bytes32 claimId = sha256(abi.encodePacked("bob@email.com"));
        vm.prank(alice);
        evenNumber.deposit{value: 1 ether}(claimId);
        assertEq(address(evenNumber).balance, 1 ether);
        assertEq(alice.balance, 4 ether);

        // claim as bob

        uint256 number = 12345678;
        (bytes memory journal, bytes32 post_state_digest, bytes memory seal) =
            prove(Elf.IS_EVEN_PATH, abi.encode(number));

        vm.prank(bob);
        evenNumber.claim(claimId, post_state_digest, seal);
        assertEq(address(evenNumber).balance, 0);
        assertEq(bob.balance, 6 ether);
    }
}
