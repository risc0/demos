// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.21;

library Types {
    enum DepositState {
        Waiting,
        Claimed,
        Withdrawn
    }

    struct Deposit {
        DepositState state;
        uint256 salt;
        address token;
        uint256 amount;
        bytes32 claimId;
        bytes32 depositId;
    }

    struct Proof {
        bytes seal;
        bytes32 postStateDigest;
        bytes journal;
    }
}

library Errors {
    error DepositFailed(bytes32 id);
    error ClaimFailed(bytes32 id);
    error WithdrawFailed(bytes32 id);
    error DepositAlreadyExists(bytes32 id);
    error DepositDoesNotExist(bytes32 id);
    error InvalidProof(Types.Proof proof);
    error InvalidDepositState(bytes32 id);
    error InvalidFee();
}

library Events {
    /**
     * @dev Emitted when a claim is made.
     * @param id An identifier for the claim.
     * @param account The address of the claimant.
     * @param amount The amount claimed.
     */
    event Claimed(bytes indexed id, address indexed account, uint256 amount);

    /**
     * @dev Emitted when a deposit is made.
     * @param id An identifier for the deposit.
     * @param account The address of the depositor.
     * @param amount The amount deposited.
     */
    event Deposited(bytes indexed id, address indexed account, uint256 amount);

    /**
     * @dev Emitted when funds are withdrawn from a deposit.
     * @param id An identifier for the deposit.
     * @param account The address of the account withdrawing funds.
     * @param amount The amount withdrawn.
     */
    event Withdrawn(bytes indexed id, address indexed account, uint256 amount);
}
