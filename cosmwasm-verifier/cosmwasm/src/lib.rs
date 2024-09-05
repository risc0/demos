use std::rc::Rc;

use cosmwasm_std::{
    entry_point, to_json_binary, Binary, Deps, DepsMut, Env, MessageInfo, Response, StdError,
    StdResult,
};
use cw_storage_plus::Item;
use risc0_zkvm::{sha::Digestible, Groth16Receipt, Journal, MaybePruned, ReceiptClaim};
use serde::{Deserialize, Serialize};

pub const IMAGE_ID: Item<[u32; 8]> = Item::new("image_id");

#[derive(Serialize, Deserialize, PartialEq, Debug, Clone)]
pub struct InstantiateMsg {
    pub image_id: [u32; 8],
}

#[entry_point]
pub fn instantiate(
    deps: DepsMut,
    _env: Env,
    _info: MessageInfo,
    msg: InstantiateMsg,
) -> StdResult<Response> {
    IMAGE_ID.save(deps.storage, &msg.image_id)?;

    Ok(Response::new())
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub enum QueryMsg {
    Verify {
        receipt: Rc<(Groth16Receipt<ReceiptClaim>, Journal)>,
    },
}

#[entry_point]
pub fn query(deps: Deps, _env: Env, msg: QueryMsg) -> StdResult<Binary> {
    match msg {
        QueryMsg::Verify { receipt } => verify(deps, &receipt),
    }
}

#[entry_point]
pub fn execute(deps: DepsMut, _env: Env, _info: MessageInfo, msg: QueryMsg) -> StdResult<Response> {
    match msg {
        QueryMsg::Verify { receipt } => {
            verify(deps.as_ref(), &receipt).map(|res| Response::new().set_data(res))
        }
    }
}

fn verify(
    deps: Deps,
    (receipt, journal): &(Groth16Receipt<ReceiptClaim>, Journal),
) -> StdResult<Binary> {
    let image_id = IMAGE_ID.load(deps.storage)?;

    // Verify receipt.
    receipt.verify_integrity().unwrap();

    // Check that the claim on the verified receipt matches what was expected. Since we have
    // constrained all field in the ReceiptClaim, we can directly construct the expected digest
    // and do not need to open the claim digest on the inner receipt.
    let expected_claim = ReceiptClaim::ok(image_id, MaybePruned::Pruned(journal.digest()));
    if expected_claim.digest() != receipt.claim.digest() {
        return Err(StdError::generic_err("Claim digest mismatch"));
    }

    to_json_binary(journal.bytes.as_slice())
}

#[cfg(test)]
mod tests {
    use super::*;
    use cosmwasm_std::Addr;
    use cw_multi_test::{App, ContractWrapper, Executor};

    #[test]
    fn verify_query() {
        // Read image_id from JSON file
        let image_id_json = include_bytes!("../../factors_id.json");
        let image_id: [u32; 8] = serde_json::from_slice(image_id_json).unwrap();

        // Read receipt from JSON file
        let receipt_json = include_bytes!("../../snark-receipt.json");
        let receipt = serde_json::from_slice(receipt_json).unwrap();

        let mut app = App::default();

        let code = ContractWrapper::new(execute, instantiate, query);
        let code_id = app.store_code(Box::new(code));

        let addr = app
            .instantiate_contract(
                code_id,
                Addr::unchecked("owner"),
                &InstantiateMsg { image_id },
                &[],
                "Contract",
                None,
            )
            .unwrap();

        let resp: Vec<u8> = app
            .wrap()
            .query_wasm_smart(
                addr,
                &QueryMsg::Verify {
                    receipt: Rc::new(receipt),
                },
            )
            .unwrap();

        assert_eq!([63, 0, 0, 0, 0, 0, 0, 0].as_slice(), &resp);
    }
}
