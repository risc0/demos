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

import {IRiscZeroVerifier} from "risc0/IRiscZeroVerifier.sol";
import {ImageID} from "./ImageID.sol"; // auto-generated contract after running `cargo build`.

contract EvenNumber {

    enum DepositState {
        Deposited,
        Claimed
    }

    struct Deposit {
        DepositState state;
        bytes32 depositId;
        bytes32 claimId;
        uint256 amount;
    }

    struct Proof {
        bytes seal;
        bytes32 postStateDigest;
        bytes journal;
    }

    /// @notice RISC Zero verifier contract address.
    IRiscZeroVerifier public immutable verifier;
    /// @notice Image ID of the only zkVM binary to accept verification from.
    bytes32 public constant imageId = ImageID.IS_EVEN_ID;

    Deposit[] private deposits;

    mapping(bytes32 => uint256[]) public claimMem;
    mapping(bytes32 => uint256[]) public depositMem;

    /// @notice Initialize the contract, binding it to a specified RISC Zero verifier.
    constructor(IRiscZeroVerifier _verifier) {
        verifier = _verifier;
    }

    function deposit(bytes32 claimId) public payable {
        bytes32 depositId = sha256(abi.encodePacked(msg.sender, claimId));

        Deposit memory deposit = Deposit({
            state: DepositState.Deposited,
            depositId: depositId,
            claimId: claimId,
            amount: msg.value
        });

        deposits.push(deposit);

        depositMem[depositId].push(deposits.length - 1);
        claimMem[claimId].push(deposits.length - 1);
    }

    function claim(address payable to, bytes32 claimId, bytes32 postStateDigest, bytes calldata seal) public {
        bytes memory journal = abi.encode(to, claimId);
        require(verifier.verify(seal, imageId, postStateDigest, sha256(journal)));

        require(claimMem[claimId].length > 0, "No deposits found for the given claimId");

        uint256 totalAmount = 0;
        for (uint256 i = 0; i < claimMem[claimId].length; ++i) {
            uint256 depositIndex = claimMem[claimId][i];
            Deposit storage deposit = deposits[depositIndex];

            require(deposit.state != DepositState.Claimed, "Deposit already claimed");

            totalAmount += deposit.amount;
            deposit.state = DepositState.Claimed;
        }

        to.transfer(totalAmount);
    }
}
