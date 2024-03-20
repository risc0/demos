// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.21;

import {IERC20} from "openzeppelin/token/ERC20/IERC20.sol";
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
contract ZRP is Ownable, Pausable {

    bytes32 public imageId;
    uint256 public claimFee;
    IRiscZeroVerifier public verifier;

    Types.Deposit[] private deposits;

    mapping(bytes32 => uint256) public claimBalance;
    mapping(bytes32 => uint256) public depositBalance;

    mapping(bytes32 => bool) private depositExists;
    mapping(bytes32 => uint256) private lastClaimIndex;
    mapping(bytes32 => uint256[]) private claimDepositIndices;

    /**
     * @dev Constructor initializes the contract with a verifier and imageId.
     * @param initVerifier The address of the initial verifier contract.
     * @param initImgId The initial image id.
     */
    constructor(IRiscZeroVerifier initVerifier, bytes32 initImgId) {
        verifier = initVerifier;
        imageId = initImgId;
    }

    /**
     * @dev Allows a user to deposit tokens or Ether.
     * @param id An identifier for the deposit.
     * @param token The address of the token contract, or zero-address for Ether.
     * @param amount The amount to deposit.
     * @param salt A unique value to avoid deposit id collisions.
     */
    function deposit(bytes memory id, address token, uint256 amount, uint256 salt) external payable whenNotPaused {
        bytes32 depositId = getDepositId(msg.sender, id, token, salt);

        if (depositExists[depositId]) {
            revert Errors.DepositAlreadyExists(depositId);
        }

        bytes32 claimId = getClaimId(id, token);

        Types.Deposit memory dep = Types.Deposit({
            state: Types.DepositState.Waiting,
            depositId: depositId,
            claimId: claimId,
            amount: amount,
            token: token,
            salt: salt
        });

        deposits.push(dep);

        depositExists[depositId] = true;

        claimDepositIndices[claimId].push(deposits.length - 1);

        if (token == address(0)) {
            if (msg.value != amount) {
                revert Errors.DepositFailed(claimId);
            }
            depositBalance[depositId] += msg.value;
            claimBalance[claimId] += msg.value;
        } else {
            if (!IERC20(token).transferFrom(msg.sender, address(this), amount)) {
                revert Errors.DepositFailed(claimId);
            }
            depositBalance[depositId] += amount;
            claimBalance[claimId] += amount;
        }
        emit Events.Deposited(id, msg.sender, amount);
    }

    /**
     * @dev Allows a user to claim deposits.
     * @param data The proof data.
     * @param token The address of the token contract, or zero-address for Ether.
     */
    function claim(bytes memory data, address token) external whenNotPaused {
        Types.Proof memory proof = abi.decode(data, (Types.Proof));

        if (!verifier.verify(proof.seal, imageId, proof.postStateDigest, proof.journal)) {
            revert Errors.InvalidProof(proof);
        }

        (address beneficiary, bytes memory id) = abi.decode(proof.journal, (address, bytes));

        if (beneficiary != msg.sender) {
            revert Errors.InvalidProof(proof);
        }

        bytes32 claimId = getClaimId(id, token);
        claimBalance[claimId] = 0;

        uint256 depositCount = claimDepositIndices[claimId].length;

        uint256 amount = 0;

        for (uint256 i = lastClaimIndex[claimId]; i < depositCount; ++i) {
            uint256 index = claimDepositIndices[claimId][i];
            Types.Deposit storage dep = deposits[index];

            if (dep.state == Types.DepositState.Waiting && dep.token == token) {
                depositBalance[dep.depositId] = 0;
                dep.state = Types.DepositState.Claimed;
                amount += dep.amount;
            }
        }

        lastClaimIndex[claimId] = depositCount;

        amount -= calculateFee(amount);

        if (token == address(0)) {
            payable(beneficiary).transfer(amount);
        } else {
            if (!IERC20(token).transfer(beneficiary, amount)) {
                revert Errors.ClaimFailed(claimId);
            }
        }
        emit Events.Claimed(id, beneficiary, amount);
    }

    /**
     * @dev Allows a user to clawback deposits.
     * @param id An identifier for the deposit.
     * @param token The address of the token contract, or zero-address for Ether.
     * @param salt The salt used when the deposit was made.
     */
    function withdrawDeposit(bytes memory id, address token, uint256 salt) external whenNotPaused {
        bytes32 depositId = getDepositId(msg.sender, id, token, salt);

        if (!depositExists[depositId]) {
            revert Errors.WithdrawFailed(depositId);
        }

        bytes32 claimId = getClaimId(id, token);

        uint256 depositCount = claimDepositIndices[claimId].length;

        uint256 amount = 0;

        for (uint256 i = 0; i < depositCount; ++i) {
            uint256 index = claimDepositIndices[claimId][i];
            Types.Deposit storage dep = deposits[index];

            if (dep.depositId == depositId && dep.token == token) {
                if (dep.state != Types.DepositState.Waiting) {
                    revert Errors.InvalidDepositState(depositId);
                }

                dep.state = Types.DepositState.Withdrawn;
                amount += dep.amount;
            }
        }

        depositBalance[depositId] = 0;
        claimBalance[claimId] -= amount;

        if (token == address(0)) {
            payable(msg.sender).transfer(amount);
        } else {
            if (!IERC20(token).transfer(msg.sender, amount)) {
                revert Errors.WithdrawFailed(claimId);
            }
        }
        emit Events.Withdrawn(id, msg.sender, amount);
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
     * @dev Set the fee percentage.
     * @param feePercentage The new fee percentage.
     */
    function setFee(uint256 feePercentage) external onlyOwner {
        if (feePercentage >= 100) {
            revert Errors.InvalidFee();
        }
        claimFee = feePercentage;
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

    /**
     * @dev Get claim id
     * @param id The claimer identifier.
     * @param token The address of the token for the claim.
     */
    function getClaimId(bytes memory id, address token) public pure returns (bytes32) {
        return _getKey(address(0), "claim", id, token, 0);
    }

    /**
     * @dev Get deposit id
     * @param depositor The depositor address.
     * @param id The deposit identifier.
     * @param token The address of the token for the deposit.
     * @param salt The salt used when the deposit was made.
     */
    function getDepositId(address depositor, bytes memory id, address token, uint256 salt)
        public
        pure
        returns (bytes32)
    {
        return _getKey(depositor, "deposit", id, token, salt);
    }

    /**
     * @dev Calculate the fee for a given amount.
     * @param amount The amount to calculate the fee for.
     */
    function calculateFee(uint256 amount) public view returns (uint256) {
        return (amount * claimFee) / 100;
    }

    /**
     * @dev Internal function to generate a key based on the given parameters.
     * @param about An address value.
     * @param key A string value.
     * @param id An identifier.
     * @param token The address of the token contract, or zero-address for Ether.
     * @param salt A unique value.
     * @return The generated key.
     */
    function _getKey(address about, string memory key, bytes memory id, address token, uint256 salt)
        internal
        pure
        returns (bytes32)
    {
        return keccak256(abi.encodePacked(about, key, id, token, salt));
    }
}
