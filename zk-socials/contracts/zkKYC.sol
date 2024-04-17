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
import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract zkKYC is ERC721 {
    IRiscZeroVerifier public immutable verifier;

    bytes32 public constant imageId = ImageID.JWT_VALIDATOR_ID;

    event Minted(address indexed to, bytes32 indexed claimId);
    event Burned(uint256 indexed tokenId);

    error InvalidMint(string message);
    error NotTokenOwner(string message);
    error TokenNotTransferable(string message);

    constructor(IRiscZeroVerifier _verifier, string memory name, string memory symbol) ERC721(name, symbol) {
        verifier = _verifier;
    }

    function mint(address to, bytes32 claimId, bytes32 postStateDigest, bytes calldata seal) public {
        if (to == address(0)) revert InvalidMint("mint::Invalid recipient address");
        if (claimId == bytes32(0)) revert InvalidMint("mint::Empty claimId");
        if (balanceOf(to) != 0) revert InvalidMint("mint::Already Minted");
        if (!verifier.verify(seal, imageId, postStateDigest, sha256(abi.encode(to, claimId)))) {
            revert InvalidMint("mint::Invalid proof");
        }
        _mint(to, uint256(claimId));

        emit Minted(to, claimId);
    }

    function burn(uint256 tokenId) public {
        if (msg.sender != ownerOf(tokenId)) revert NotTokenOwner("burn::Not Owner");
        _burn(tokenId);

        emit Burned(tokenId);
    }

    function transferFrom(address from, address to, uint256 tokenId) public virtual override {
        revert TokenNotTransferable("transferFrom::Transfer Disabled");
    }

    function approve(address to, uint256 tokenId) public virtual override {
        revert TokenNotTransferable("approve::Transfer Disabled");
    }

    function setApprovalForAll(address operator, bool approved) public virtual override {
        revert TokenNotTransferable("setApprovalForAll::Approval Disabled");
    }
}
