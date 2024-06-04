use near_sdk::near;
use risc0_zkvm::Receipt;

// Define the contract structure
#[near(contract_state)]
#[derive(Default)]
pub struct Contract;

#[near]
impl Contract {
    pub fn verify_proof(image_id: [u32; 8], receipt: Receipt) {
        receipt.verify(image_id).unwrap()
    }
}
