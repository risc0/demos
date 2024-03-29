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

/// @title A starter application using RISC Zero.
/// @notice This basic application holds a number, guaranteed to be even.
/// @dev This contract demonstrates one pattern for offloading the computation of an expensive
///      or difficult to implement function to a RISC Zero guest running on Bonsai.
contract EvenNumber {
    /// @notice RISC Zero verifier contract address.
    IRiscZeroVerifier public immutable verifier;
    /// @notice Image ID of the only zkVM binary to accept verification from.
    bytes32 public constant imageId = ImageID.IS_EVEN_ID;

    /// @notice A number that is guaranteed, by the RISC Zero zkVM, to be even.
    ///         It can be set by calling the `set` function.
    uint256 public number;

    Types.Deposit[] private deposits;

    mapping(bytes32 => uint256[]) public claimMem;
    mapping(bytes32 => uint256[]) public depositMem;

    /// @notice Initialize the contract, binding it to a specified RISC Zero verifier.
    constructor(IRiscZeroVerifier _verifier) {
        verifier = _verifier;
        number = 0;
    }

    /// @notice Set the even number stored on the contract. Requires a RISC Zero proof that the number is even.
    function set(uint256 x, bytes32 postStateDigest, bytes calldata seal) public {
        // Construct the expected journal data. Verify will fail if journal does not match.
        bytes memory journal = abi.encode(x);
        require(verifier.verify(seal, imageId, postStateDigest, sha256(journal)));
        number = x;
    }

    /// @notice Returns the number stored.
    function get() public view returns (uint256) {
        return number;
    }

    function deposit(bytes32 claimId) public payable {
        bytes32 depositId = sha256(abi.encodePacked(msg.sender, claimId));

        Types.Deposit memory deposit = Types.Deposit({
            state: Types.DepositState.Deposited,
            depositId: depositId,
            claimId: claimId,
            amount: msg.value
        });

        deposits.push(deposit);

        depositMem[depositId].push(deposits.length - 1);
        claimMem[claimId].push(deposits.length - 1);
    }

    function claim(bytes32 claimId, bytes32 postStateDigest, bytes calldata seal) public {
        bytes memory journal = abi.encode(msg.sender, claimId);
        require(verifier.verify(seal, imageId, postStateDigest, sha256(journal)));

        require(claimMem[claimId].length > 0, "No deposits found for the given claimId");

        uint256 totalAmount = 0;
        for (uint256 i = 0; i < claimMem[claimId].length; ++i) {
            uint256 depositIndex = claimMem[claimId][i];
            Types.Deposit storage deposit = deposits[depositIndex];

            require(deposit.state != Types.DepositState.Claimed, "Deposit already claimed");

            totalAmount += deposit.amount;
            deposit.state = Types.DepositState.Claimed;
        }

        payable(msg.sender).transfer(totalAmount);
    }
}

library Types {
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
}
