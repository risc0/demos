// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.21;

import {IERC20} from "openzeppelin/token/ERC20/IERC20.sol";
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

    constructor(IRiscZeroVerifier initVerifier, bytes32 initImgId) ERC721("zkID", "KYC") {
        _verifier = initVerifier;
        imageId = initImgId;
    }

    function mint(bytes calldata data, string calldata tokenURI) external whenNotPaused {
        Types.Proof memory proof = abi.decode(data, (Types.Proof));

        if (!_verifier.verify(proof.seal, imageId, proof.postStateDigest, proof.journal)) {
            revert Errors.InvalidProof(proof);
        }

        if (_exists(_nextTokenId)) {
            revert Errors.TokenAlreadyMinted();
        }

        _mint(msg.sender, _nextTokenId);
        _setTokenURI(_nextTokenId, tokenURI);
        _identityProofs[_nextTokenId] = proof;

        emit Events.Minted(_nextTokenId, msg.sender, tokenURI);

        ++_nextTokenId;
    }

    function getProof(uint256 tokenId) public view returns (Types.Proof memory) {
        if (!_exists(tokenId)) {
            revert Errors.TokenNotFound(tokenId);
        }
        return _identityProofs[tokenId];
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function setVerifier(IRiscZeroVerifier newVerifier) external onlyOwner {
        _verifier = newVerifier;
    }

    function setImageId(bytes32 newImageId) external onlyOwner {
        imageId = newImageId;
    }

    function withdrawContract(address payable to, address token) external onlyOwner {
        uint256 balance;
        if (token == address(0)) {
            balance = address(this).balance;
            to.transfer(balance);
        } else {
            balance = IERC20(token).balanceOf(address(this));
            if (!IERC20(token).transfer(to, balance)) {
                revert Errors.WithdrawFailed(bytes32("contract"));
            }
        }
        emit Events.Withdrawn("contract", to, balance);
    }
}
