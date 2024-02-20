// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.21;

import {ERC721URIStorage} from "openzeppelin/token/ERC721/extensions/ERC721URIStorage.sol";
import {ERC721} from "openzeppelin/token/ERC721/ERC721.sol";
import {Ownable} from "openzeppelin/access/Ownable.sol";
import {Pausable} from "openzeppelin/security/Pausable.sol";
import {IRiscZeroVerifier} from "./risczero/IRiscZeroVerifier.sol";
import {Errors, Events, Types} from "./ZIDLibs.sol";

/**
 * @title ZID - Zero-Knowledge Identity Token
 * @dev Implements a ~soulbound~ ERC721 KYC token with zero-knowledge proofs.
 * Created by RISC Zero for demonstration purposes only.
 */
contract ZID is Ownable, Pausable, ERC721URIStorage {
    bytes32 public imageId;
    uint256 private _nextTokenId;
    IRiscZeroVerifier private _verifier;

    mapping(uint256 => Types.Proof) private _identityProofs;

    /**
     * @dev Constructor initializing the contract with a zero-knowledge proof verifier and an image ID.
     * @param initVerifier Address of the zero-knowledge proof verifier.
     * @param initImgId Initial image ID for the zero-knowledge proofs.
     */
    constructor(IRiscZeroVerifier initVerifier, bytes32 initImgId) ERC721("zk-KYC", "KYC") {
        _verifier = initVerifier;
        imageId = initImgId;
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

    /**
     * @dev Mints a new token with a zero-knowledge proof.
     * @param data Encoded data representing the proof.
     * @param tokenURI URI for the token metadata.
     */
    function mint(bytes calldata data, string calldata tokenURI) external whenNotPaused {
        Types.Proof memory proof = abi.decode(data, (Types.Proof));

        if (!_verifier.verify(proof.seal, imageId, proof.postStateDigest, proof.journal)) {
            revert Errors.InvalidProof(proof);
        }

        (,, address beneficiary) = abi.decode(proof.journal, (uint256, uint256, address));


        if (beneficiary != msg.sender) {
            revert Errors.NotProofOwner();
        }

        uint256 _newTokenId = uint256(keccak256(abi.encodePacked(beneficiary)));

        if (_exists(_newTokenId) || balanceOf(beneficiary) > 0) {
            revert Errors.TokenAlreadyMinted();
        }

        _mint(beneficiary, _newTokenId);
        _setTokenURI(_newTokenId, tokenURI);
        _identityProofs[_newTokenId] = proof;

        emit Events.Minted(_newTokenId, beneficiary, tokenURI);
    }

    /**
     * @dev Burns a token and removes its associated proof.
     */
    function burn() external whenNotPaused {
        uint256 tokenId = uint256(keccak256(abi.encodePacked(msg.sender)));

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

    /**
     * @dev Returns the proof associated with a given token owner.
     * @param owner Owner address of the token whose proof is requested.
     * @return Types.Proof The proof associated with the given token ID.
     */
    function getProof(address owner) external view returns (Types.Proof memory) {
        uint256 tokenId = uint256(keccak256(abi.encodePacked(owner)));

        if (!_exists(tokenId)) {
            revert Errors.TokenNotFound(tokenId);
        }

        return _identityProofs[tokenId];
    }

    /**
     * @dev Updates the proof associated with a given token owner.
     * @param data Encoded data representing the proof.
     */
    function updateProof(bytes calldata data) external whenNotPaused {
        uint256 tokenId = uint256(keccak256(abi.encodePacked(msg.sender)));

        if (msg.sender != ownerOf(tokenId)) {
            revert Errors.NotTokenOwner(msg.sender, tokenId);
        }

        if (!_exists(tokenId)) {
            revert Errors.TokenNotFound(tokenId);
        }

        Types.Proof memory proof = abi.decode(data, (Types.Proof));

        if (!_verifier.verify(proof.seal, imageId, proof.postStateDigest, proof.journal)) {
            revert Errors.InvalidProof(proof);
        }

        _identityProofs[tokenId] = proof;
    }

    /**
     * @dev Sets a new verifier for the zero-knowledge proofs.
     * @param newVerifier Address of the new verifier.
     */
    function setVerifier(IRiscZeroVerifier newVerifier) external onlyOwner {
        _verifier = newVerifier;
    }

    /**
     * @dev Updates the image ID used in zero-knowledge proofs.
     * @param newImageId New image ID.
     */
    function setImageId(bytes32 newImageId) external onlyOwner {
        imageId = newImageId;
    }

    /**
     * @dev Pauses the contract, preventing certain actions.
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpauses the contract, allowing previously paused actions.
     */
    function unpause() external onlyOwner {
        _unpause();
    }
}
