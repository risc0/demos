// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.21;

library Errors {
    error AmountInvalid(uint256 amount);
    error IdentInvalid(bytes32 ident);
    error ReceiptVerifyFailed();
    error TokenAddr(address token);
    error FeeInvalid(uint256 fee);
    error JournalLengthInvalid(uint256 length);
}
