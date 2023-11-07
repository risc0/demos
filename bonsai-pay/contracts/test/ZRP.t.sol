// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.21;

import {Test, console2} from "forge-std/Test.sol";
import {ERC20} from "openzeppelin/token/ERC20/ERC20.sol";
import {Seal} from "../src/risczero/RiscZeroGroth16Verifier.sol";
import {MockVerifier} from "../src/risczero/MockVerifier.sol";
import {ZRP} from "../src/ZRP.sol";
import {Errors, Events, Types} from "../src/ZRPLibs.sol";

contract ZRPTest is Test {
    ZRP internal zrp;
    ERC20 internal dai;

    bytes BOB_IDENT = bytes("bob@example.com");
    bytes ALICE_IDENT = bytes("alice@example.com");
    bytes MALICE_IDENT = bytes("malice@example.com");

    address alice = makeAddr("alice@example.com");
    address bob = makeAddr("bob@example.com");
    address carl = makeAddr("carl@example.com");
    address whale = makeAddr("whale@example.com");
    address malice = makeAddr("malice@example.com");

    uint256 public constant CONTROL_ID_0 = 0x0;
    uint256 public constant CONTROL_ID_1 = 0x1;

    bytes32 internal constant IMAGE_ID = bytes32(0x0);

    function setUp() public {
        // Use mock verifier
        MockVerifier verifier = new MockVerifier(CONTROL_ID_0, CONTROL_ID_1);
        zrp = new ZRP(verifier, IMAGE_ID);
        dai = new ERC20("Dai Stablecoin", "DAI");
        deal({to: bob, give: 5 ether});
        deal({token: address(dai), to: bob, give: 1_000_000e18});
        deal({to: carl, give: 5 ether});
        deal({token: address(dai), to: carl, give: 1_000_000e18});
        deal({to: malice, give: 1 ether});

        deal({to: whale, give: 100 ether});
    }

    function rollForward() public {
        vm.roll(block.number + 1);
    }

    function bob_deposit(
        bytes memory ident,
        uint256 amount,
        uint256 salt
    ) internal {
        vm.prank(bob);
        zrp.deposit{value: amount}(ident, address(0), amount, salt);
    }

    function bob_deposit_token(
        bytes memory ident,
        uint256 amount,
        uint256 salt
    ) internal {
        vm.prank(bob);
        dai.approve({spender: address(zrp), amount: amount});
        vm.prank(bob);
        zrp.deposit(ident, address(dai), amount, salt);
    }

    function carl_deposit(bytes memory ident, uint256 amount) internal {
        vm.prank(carl);
        zrp.deposit{value: amount}(ident, address(0), amount, block.number);
    }

    function test_Deposit() public {
        assertEq(bob.balance, 5 ether, "bob should have 5 ether");
        bob_deposit(ALICE_IDENT, 1 ether, block.number);
        assertEq(bob.balance, 4 ether, "bob should have 4 ether after deposit");
    }

    function test_ClaimerBalance() public {
        bob_deposit(ALICE_IDENT, 1 ether, block.number);
        carl_deposit(ALICE_IDENT, 1 ether);
        bytes32 claimId = zrp.getClaimId(ALICE_IDENT, address(0));
        assertEq(
            zrp.claimBalance(claimId),
            2 ether,
            "claim should have 2 ether"
        );
    }

    // Valid claim
    function test_Claim() public {
        bob_deposit(ALICE_IDENT, 1 ether, block.number);
        carl_deposit(ALICE_IDENT, 1 ether);

        // valid proof
        Types.Proof memory proof = Types.Proof({
            seal: "0x4141",
            postStateDigest: bytes32(0x0),
            journal: abi.encode(alice, ALICE_IDENT)
        });

        vm.prank(alice);
        zrp.claim(abi.encode(proof), address(0));

        assertEq(alice.balance, 2 ether, "alice should have 2 ether");
    }

    // Malicious claim
    function testFail_BadProofClaim() public {
        bob_deposit(ALICE_IDENT, 3 ether, block.number);

        // malicious proof
        Types.Proof memory proof = Types.Proof({
            seal: "0x6666",
            postStateDigest: bytes32(0x0),
            journal: abi.encode(alice, ALICE_IDENT)
        });

        vm.prank(malice);
        zrp.claim(abi.encode(proof), address(0));
    }

    // Valid clawback
    function test_withdrawDeposit() public {
        uint256 salt = block.number;

        bob_deposit(ALICE_IDENT, 1 ether, block.number);
        carl_deposit(ALICE_IDENT, 1 ether);

        rollForward();

        // bob claws back
        vm.prank(bob);
        zrp.withdrawDeposit(ALICE_IDENT, address(0), salt);

        assertEq(
            bob.balance,
            5 ether,
            "bob should have 5 ether after clawback"
        );

        Types.Proof memory proof = Types.Proof({
            seal: "0x4141",
            postStateDigest: bytes32(0x0),
            journal: abi.encode(alice, ALICE_IDENT)
        });

        // alice claims
        vm.prank(alice);
        zrp.claim(abi.encode(proof), address(0));

        assertEq(alice.balance, 1 ether, "alice should have 1 ether");
    }

    function test_ClaimWithClawbacks() public {
        bob_deposit(ALICE_IDENT, 1 ether, block.number);
        carl_deposit(ALICE_IDENT, 1 ether);

        rollForward();

        // bob claws back
        vm.prank(bob);
        zrp.withdrawDeposit(ALICE_IDENT, address(0), block.number - 1);

        assertEq(
            bob.balance,
            5 ether,
            "bob should have 5 ether after clawback"
        );

        // carl claws back
        vm.prank(carl);
        zrp.withdrawDeposit(ALICE_IDENT, address(0), block.number - 1);

        Types.Proof memory proof = Types.Proof({
            seal: "0x4141",
            postStateDigest: bytes32(0x0),
            journal: abi.encode(alice, ALICE_IDENT)
        });

        // alice claims
        vm.prank(alice);
        zrp.claim(abi.encode(proof), address(0));

        assertEq(
            alice.balance,
            0,
            "alice should have 0 ether after both participants clawback"
        );
    }

    function testFail_OverflowingClawbacks() public {
        bob_deposit(ALICE_IDENT, 1 ether, block.number);
        carl_deposit(ALICE_IDENT, 1 ether);

        rollForward();

        // bob claws back
        vm.prank(bob);
        zrp.withdrawDeposit(ALICE_IDENT, address(0), block.number - 1);

        assertEq(
            bob.balance,
            5 ether,
            "bob should have 5 ether after clawback"
        );

        // carl claws back
        vm.prank(carl);
        zrp.withdrawDeposit(ALICE_IDENT, address(0), block.number - 1);

        // carl claws back again
        vm.prank(carl);
        zrp.withdrawDeposit(ALICE_IDENT, address(0), block.number - 1);
    }

    function test_DepositBalanceAfterClaim() public {
        bob_deposit(ALICE_IDENT, 1 ether, block.number);
        carl_deposit(ALICE_IDENT, 1 ether);

        rollForward();

        Types.Proof memory proof = Types.Proof({
            seal: "0x4141",
            postStateDigest: bytes32(0x0),
            journal: abi.encode(alice, ALICE_IDENT)
        });

        vm.prank(alice);
        zrp.claim(abi.encode(proof), address(0));

        carl_deposit(ALICE_IDENT, 1 ether);

        assertEq(
            zrp.depositBalance(
                zrp.getDepositId(bob, ALICE_IDENT, address(0), block.number - 1)
            ),
            0,
            "bob deposit balance should be 0 after alice claim"
        );
    }

    function test_MultipleDepositsClawbacksAndClaims() public {
        bob_deposit(ALICE_IDENT, 1 ether, block.number);
        carl_deposit(ALICE_IDENT, 1 ether);
        // running balance: 2 ether

        rollForward();

        // bob claws back
        vm.prank(bob);
        zrp.withdrawDeposit(ALICE_IDENT, address(0), block.number - 1);
        // running balance:  1 ether

        carl_deposit(ALICE_IDENT, 1 ether);
        bob_deposit(ALICE_IDENT, 1 ether, block.number);
        // alice claim 3 ether

        rollForward();

        // bob claws back
        vm.prank(bob);
        zrp.withdrawDeposit(ALICE_IDENT, address(0), block.number - 1);

        // carl claws back
        vm.prank(carl);
        zrp.withdrawDeposit(ALICE_IDENT, address(0), block.number - 1);

        Types.Proof memory proof = Types.Proof({
            seal: "0x4141",
            postStateDigest: bytes32(0x0),
            journal: abi.encode(alice, ALICE_IDENT)
        });

        // running balance: 1 ether
        // alice claims
        vm.prank(alice);
        zrp.claim(abi.encode(proof), address(0));
        assertEq(
            alice.balance,
            1 ether,
            "alice should have 1 ether after both participants did their thing"
        );

        // alice balance: 1 ether

        // running balance: 0 ether

        rollForward();

        // bob deposits
        bob_deposit(ALICE_IDENT, 3 ether, block.number);
        carl_deposit(ALICE_IDENT, 2 ether);
        // running balance: 5 ether

        rollForward();

        // carl claws back
        vm.prank(carl);
        zrp.withdrawDeposit(ALICE_IDENT, address(0), block.number - 1);

        // alice claims
        vm.prank(alice);
        zrp.claim(abi.encode(proof), address(0));

        // alice balance: 1 ether + 3 ether = 4 ether
        assertEq(
            alice.balance,
            4 ether,
            "alice should have 4 ether after both participants did their thing"
        );
    }

    function test_ManyDeposits() public {
        for (uint256 i = 0; i < whale.balance; ++i) {
            vm.prank(whale);
            zrp.deposit{value: 1 ether}(
                ALICE_IDENT,
                address(0),
                1 ether,
                block.number
            );
            rollForward();
        }

        vm.prank(alice);
        zrp.claim(
            abi.encode(
                Types.Proof({
                    seal: "0x4141",
                    postStateDigest: bytes32(0x0),
                    journal: abi.encode(alice, ALICE_IDENT)
                })
            ),
            address(0)
        );

        assertEq(alice.balance, 100 ether, "alice should have all the ether");
    }

    function test_ManyDepositsAndAClaimInBetween() public {
        for (uint256 i = 0; i < whale.balance; ++i) {
            if (i == 50) {
                vm.prank(alice);
                zrp.claim(
                    abi.encode(
                        Types.Proof({
                            seal: "0x4141",
                            postStateDigest: bytes32(0x0),
                            journal: abi.encode(alice, ALICE_IDENT)
                        })
                    ),
                    address(0)
                );
            } else {
                vm.prank(whale);
                zrp.deposit{value: 1 ether}(
                    ALICE_IDENT,
                    address(0),
                    1 ether,
                    block.number
                );
                rollForward();
            }
        }

        assertEq(alice.balance, 50 ether, "alice should have half the ether");
        assertEq(
            zrp.claimBalance(zrp.getClaimId(ALICE_IDENT, address(0))),
            50 ether,
            "alice should also have a deposit of 50 ether not yet claimed"
        );
    }

    function testFail_ReusingSalt() public {
        uint256 salt = 69;
        bob_deposit(ALICE_IDENT, 1 ether, salt);
        bob_deposit(ALICE_IDENT, 1 ether, salt);
    }

    function testFail_MismatchingAddressClaim() public {
        bob_deposit(ALICE_IDENT, 1 ether, block.number);
        carl_deposit(ALICE_IDENT, 1 ether);

        // valid Proof
        Types.Proof memory proof = Types.Proof({
            seal: "0x4141",
            postStateDigest: bytes32(0x0),
            journal: abi.encode(alice, ALICE_IDENT)
        });

        // malicious claim malice pretends to be alice
        vm.prank(malice);
        zrp.claim(abi.encode(proof), address(0));
    }

    function test_OnlyOwnerCanPause() public {
        zrp.pause();
    }

    function testFail_NotOwnerPause() public {
        vm.prank(bob);
        zrp.pause();
    }

    function testFail_DepositWhenPaused() public {
        zrp.pause();
        bob_deposit(ALICE_IDENT, 1 ether, block.number);
    }

    function test_OnlyOwnerCanUnpause() public {
        zrp.pause();
        zrp.unpause();
    }

    function testFail_NotOwnerUnpause() public {
        zrp.pause();
        vm.prank(bob);
        zrp.unpause();
    }

    function testFail_OnlyOwnerCanSetFee() public {
        vm.prank(bob);
        zrp.setFee(1); // set to 1%
    }

    function test_SetFee() public {
        zrp.setFee(1); // set to 1%
        bob_deposit(ALICE_IDENT, 1 ether, block.number);

        vm.prank(alice);
        zrp.claim(
            abi.encode(
                Types.Proof({
                    seal: "0x4141",
                    postStateDigest: bytes32(0x0),
                    journal: abi.encode(alice, ALICE_IDENT)
                })
            ),
            address(0)
        );

        assertEq(alice.balance, 0.99 ether, "alice should have 0.99 ether");
        assertEq(
            address(zrp).balance,
            0.01 ether,
            "contract should have 0.01 ether"
        );
    }

    function testFail_SetFeeTooHigh() public {
        zrp.setFee(100); // set to 100%
    }

    function test_OnlyOwnerCanWithdraw() public {
        // set the fee to 1%
        zrp.setFee(1);
        bob_deposit(ALICE_IDENT, 1 ether, block.number);

        vm.prank(alice);
        zrp.claim(
            abi.encode(
                Types.Proof({
                    seal: "0x4141",
                    postStateDigest: bytes32(0x0),
                    journal: abi.encode(alice, ALICE_IDENT)
                })
            ),
            address(0)
        );

        zrp.withdrawContract(alice, address(0));

        assertEq(
            address(zrp).balance,
            0,
            "contract should have 0 ether after withdraw"
        );
    }

    function testFail_NotOwnerWithdraw() public {
        vm.prank(bob);
        zrp.withdrawContract(alice, address(0));
    }

    // ERC20 Tests
    function test_TokenDeposit() public {
        assertEq(
            dai.balanceOf(bob),
            1_000_000e18,
            "bob should have 1_000_000e18 dai"
        );
        bob_deposit_token(ALICE_IDENT, 1_000e18, block.number);
        assertEq(
            dai.balanceOf(bob),
            999_000e18,
            "bob should have 999_000e18 dai after deposit"
        );
        assertEq(
            dai.balanceOf(address(zrp)),
            1_000e18,
            "contract should have 1_000e18 dai after deposit"
        );
    }

    function test_ClaimToken() public {
        bob_deposit_token(ALICE_IDENT, 1_000e18, block.number);

        assertEq(
            dai.balanceOf(alice),
            0,
            "alice should have 0 dai before claim"
        );
        vm.prank(alice);
        zrp.claim(
            abi.encode(
                Types.Proof({
                    seal: "0x4141",
                    postStateDigest: bytes32(0x0),
                    journal: abi.encode(alice, ALICE_IDENT)
                })
            ),
            address(dai)
        );

        assertEq(
            dai.balanceOf(alice),
            1_000e18,
            "alice should have 1_000e18 dai after claim"
        );
    }
}
