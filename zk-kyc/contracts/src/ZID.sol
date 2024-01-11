// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.21;

import {ERC721URIStorage} from "openzeppelin/token/ERC721/extensions/ERC721URIStorage.sol";
import {ERC721} from "openzeppelin/token/ERC721/ERC721.sol";
import {Ownable} from "openzeppelin/access/Ownable.sol";
import {Pausable} from "openzeppelin/security/Pausable.sol";
import {IRiscZeroVerifier} from "./risczero/IRiscZeroVerifier.sol";
import {Errors, Events, Types} from "./ZIDLibs.sol";

contract ZID is Ownable, Pausable, ERC721URIStorage {
    bytes32 public imageId;
    uint256 private _nextTokenId;
    IRiscZeroVerifier private _verifier;

    mapping(uint256 => Types.Proof) private _identityProofs;

    constructor(IRiscZeroVerifier initVerifier, bytes32 initImgId) ERC721("zk-KYC", "KYC") {
        _verifier = initVerifier;
        imageId = initImgId;
    }

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

    function mint(bytes calldata data, string calldata tokenURI) external whenNotPaused {
        Types.Proof memory proof = abi.decode(data, (Types.Proof));

        if (!_verifier.verify(proof.seal, imageId, proof.postStateDigest, proof.journal)) {
            revert Errors.InvalidProof(proof);
        }

        address beneficiary = abi.decode(proof.journal, (address));

        if (beneficiary != msg.sender) {
            revert Errors.NotProofOwner();
        }

        if (_exists(_nextTokenId)) {
            revert Errors.TokenAlreadyMinted();
        }

        if (balanceOf(beneficiary) > 0) {
            revert Errors.TokenAlreadyMinted();
        }

        ++_nextTokenId;
        _mint(beneficiary, _nextTokenId);
        _setTokenURI(_nextTokenId, tokenURI);
        _identityProofs[_nextTokenId] = proof;

        emit Events.Minted(_nextTokenId, msg.sender, tokenURI);
    }

    function burn(uint256 tokenId) external whenNotPaused {
        if (msg.sender != ownerOf(tokenId)) {
            revert Errors.NotTokenOwner(msg.sender, tokenId);
        }

        if (!_exists(tokenId)) {
            revert Errors.TokenNotFound(tokenId);
        }
        _burn(tokenId);
        delete _identityProofs[tokenId];
        emit Events.Burned(tokenId, msg.sender);
    }

    function getProof(uint256 tokenId) external view returns (Types.Proof memory) {
        if (!_exists(tokenId)) {
            revert Errors.TokenNotFound(tokenId);
        }
        return _identityProofs[tokenId];
    }

    function setVerifier(IRiscZeroVerifier newVerifier) external onlyOwner {
        _verifier = newVerifier;
    }

    function setImageId(bytes32 newImageId) external onlyOwner {
        imageId = newImageId;
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }
}
