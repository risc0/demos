// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.21;

library Types {
    struct Proof {
        bytes seal;
        bytes32 postStateDigest;
        bytes journal;
    }
}

library Errors {
    error WithdrawFailed(bytes32 id);
    error InvalidProof(Types.Proof proof);
    error TokenAlreadyMinted();
    error TokenNotFound(uint256 id);
}

library Events {
    event Withdrawn(bytes indexed id, address indexed account, uint256 amount);
    event Minted(uint256 indexed id, address indexed minter, string tokenURI);
}
