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
import {ERC721} from "@openzeppelin/token/ERC721/ERC721.sol";

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

    event Minted(address indexed to, bytes32 indexed claimId);

    error InvalidMint(string message);
    error NotTokenOwner();

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

    function mint(
        address to, 
        bytes32 claimId, 
        bytes32 postStateDigest,
        bytes calldata seal
    ) public {
        if (to == address(0)) revert InvalidMint("Invalid recipient address");
        if (claimId == bytes32(0)) revert InvalidMint("Empty claimId");
        if (!verifier.verify(seal, imageId, postStateDigest, sha256(abi.encode(to, claimId)))) {
            revert InvalidMint("Invalid proof");
        }

        _mint(to, uint256(claimId));

        emit Minted(to, claimId);
    }

    function burn(uint256 tokenId) public {
        if (msg.sender != ownerOf(tokenId)) revert NotTokenOwner();
        _burn(tokenId);
    }

    /**
     * @dev Overrides the _beforeTokenTransfer hook from ERC721 to restrict token transfers.
     */
    function _beforeTokenTransfer(address from, address to, uint256 tokenId, uint256 batchSize)
        internal
        virtual
        override
    {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
        if (to != address(0) && from != address(0)) {
            revert Errors.TokenNotTransferable();
        }
    }
    
}
