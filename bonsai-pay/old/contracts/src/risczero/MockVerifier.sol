// Copyright 2023 RISC Zero, Inc.
//
// The RiscZeroGroth16Verifier is a free software: you can redistribute it
// and/or modify it under the terms of the GNU General Public License as
// published by the Free Software Foundation, either version 3 of the License,
// or (at your option) any later version.
//
// The RiscZeroGroth16Verifier is distributed in the hope that it will be
// useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General
// Public License for more details.
//
// You should have received a copy of the GNU General Public License along with
// the RiscZeroGroth16Verifier. If not, see <https://www.gnu.org/licenses/>.
//
// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.21;

import {
    IRiscZeroVerifier,
    Receipt,
    ReceiptMetadata,
    ReceiptMetadataLib,
    ExitCode,
    SystemExitCode
} from "./IRiscZeroVerifier.sol";

contract MockVerifier is IRiscZeroVerifier {
    using ReceiptMetadataLib for ReceiptMetadata;

    // Control ID hash for the identity_p254 predicate decomposed as implemented by splitDigest.
    uint256 internal control_id_0;
    uint256 internal control_id_1;

    constructor(uint256 _control_id_0, uint256 _control_id_1) {
        control_id_0 = _control_id_0;
        control_id_1 = _control_id_1;
    }

    function verify(Receipt memory) public pure returns (bool) {
        return true;
    }

    function verify(bytes memory seal, bytes32 imageId, bytes32 postStateDigest, bytes32 journalHash)
        public
        pure
        returns (bool)
    {
        Receipt memory receipt = Receipt(
            seal, ReceiptMetadata(imageId, postStateDigest, ExitCode(SystemExitCode.Halted, 0), bytes32(0), journalHash)
        );
        return verify(receipt);
    }

    function verify(bytes memory seal, bytes32 imageId, bytes32 postStateDigest, bytes calldata journal)
        public
        pure
        returns (bool)
    {
        if (bytes32(seal) != bytes32("0x4141")) {
            return false;
        }
        return verify(seal, imageId, postStateDigest, sha256(journal));
    }
}
