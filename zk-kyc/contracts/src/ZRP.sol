// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.21;

import {IERC20} from "openzeppelin/token/ERC20/IERC20.sol";
import {ERC721URIStorage} from "openzeppelin/token/ERC721/extensions/ERC721URIStorage.sol";
import {ERC721} from "openzeppelin/token/ERC721/ERC721.sol";
import {Ownable} from "openzeppelin/access/Ownable.sol";
import {Pausable} from "openzeppelin/security/Pausable.sol";
import {IRiscZeroVerifier} from "./risczero/IRiscZeroVerifier.sol";
import {Errors, Events, Types} from "./ZRPLibs.sol";

/**
 * @title ZRP Contract
 * @author RISC Zero
 * @dev A contract for managing deposits, claims, and clawbacks.
 * It also manages the verification of proofs and handles token and ether transfers.
 */
contract ZRP is Ownable, Pausable, ERC721URIStorage {
    bytes32 public imageId;
    uint256 private tokenId;
    uint256 public mintFee;
    IRiscZeroVerifier public verifier;

    mapping(uint256 => Types.Proof) private tokenProofs;

    /**
     * @dev Constructor initialis the contract with a verifier and imageId.
     * @param initVerifier The address of the initial verifier contract.
     * @param initImgId The initial image id.
     */
    constructor(IRiscZeroVerifier initVerifier, bytes32 initImgId) ERC721("zkID", "KYC") {
        verifier = initVerifier;
        imageId = initImgId;
    }

    function mint(bytes memory data, string memory tokenURI) public whenNotPaused {
        Types.Proof memory proof = abi.decode(data, (Types.Proof));

        // Verify the proof
        if (!verifier.verify(proof.seal, imageId, proof.postStateDigest, proof.journal)) {
            revert Errors.InvalidProof(proof);
        }

        // Ensure the token hasn't been minted yet
        if (_exists(tokenId)) {
          revert Errors.TokenAlreadyMinted();
        }

        // Mint the token
        _mint(msg.sender, tokenId);
        _setTokenURI(tokenId, tokenURI);

        tokenProofs[tokenId] = proof;

        ++tokenId;

        emit Events.Minted();
    }

    /**
     * @dev Pause the contract.
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause the contract.
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev Set a new verifier.
     * @param newVerifier The address of the new verifier contract.
     */
    function setVerifier(IRiscZeroVerifier newVerifier) external onlyOwner {
        verifier = newVerifier;
    }

    /**
     * @dev Set a new image id.
     * @param newImageId The new image id.
     */
    function setImageId(bytes32 newImageId) external onlyOwner {
        imageId = newImageId;
    }

    /**
     * @dev Withdraw the contract balance.
     * @param to The address to withdraw to.
     * @param token The address of the token to withdraw, or zero-address for Ether.
     */
    function withdrawContract(address to, address token) external onlyOwner {
        if (token == address(0)) {
            payable(to).transfer(address(this).balance);
        } else {
            if (!IERC20(token).transfer(to, IERC20(token).balanceOf(address(this)))) {
                revert Errors.WithdrawFailed(bytes32("contract"));
            }
        }
        emit Events.Withdrawn("contract", to, address(this).balance);
    }

}
