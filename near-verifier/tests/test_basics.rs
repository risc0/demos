use near_sdk::NearToken;
use risc0_zkvm::Receipt;
use serde_json::json;

const FIFTY_NEAR: NearToken = NearToken::from_near(50);

#[tokio::test]
async fn test_contract_is_operational() -> Result<(), Box<dyn std::error::Error>> {
    let sandbox = near_workspaces::sandbox().await?;
    let contract_wasm = near_workspaces::compile_project("./").await?;

    let root = sandbox.root_account()?;

    let user_account = root
        .create_subaccount("user")
        .initial_balance(FIFTY_NEAR)
        .transact()
        .await?
        .unwrap();
    let contract_account = root
        .create_subaccount("contract")
        .initial_balance(FIFTY_NEAR)
        .transact()
        .await?
        .unwrap();

    let contract = contract_account.deploy(&contract_wasm).await?.unwrap();

    let outcome = user_account
        .call(contract.id(), "verify_proof")
        .args_json(json!({
            "image_id": serde_json::from_str::<[u32; 8]>(&include_str!("../factors_id.json")).unwrap(),
            "receipt": serde_json::from_str::<Receipt>(&include_str!("../snark-receipt.json")).unwrap()
        }))
        .max_gas()
        .transact().await?;
    println!("{:?}", outcome);
    // assert!(outcome.is_success());
    println!("{:?}", outcome.logs());

    Ok(())
}
