use alloy_primitives::{FixedBytes, U256};
use alloy_sol_types::{sol, SolInterface, SolType, SolValue};
use anyhow::{Context, Result};
use clap::Parser;
use ethers::prelude::*;
use log::info;
use methods::JWT_VALIDATOR_ELF;
use risc0_ethereum_contracts::groth16::{self, abi_encode};
use risc0_zkvm::{default_prover, ExecutorEnv, ProverOpts, VerifierContext};
use tokio::sync::oneshot;
use warp::{reject::Rejection, Filter};
use IBonsaiPay::claimCall;

sol! {
    interface IBonsaiPay {
        function claim(address payable to, bytes32 claim_id, bytes calldata seal);
    }

    struct Input {
        uint256 identity_provider;
        string jwt;
    }

    struct ClaimsData {
        address msg_sender;
        bytes32 claim_id;
    }
}

/// Wrapper of a `SignerMiddleware` client to send transactions to the given
/// contract's `Address`.
pub struct TxSender {
    chain_id: u64,
    client: SignerMiddleware<Provider<Http>, Wallet<k256::ecdsa::SigningKey>>,
    contract: Address,
}

impl TxSender {
    /// Creates a new `TxSender`.
    pub fn new(chain_id: u64, rpc_url: &str, private_key: &str, contract: &str) -> Result<Self> {
        let provider = Provider::<Http>::try_from(rpc_url)?;
        let wallet: LocalWallet = private_key.parse::<LocalWallet>()?.with_chain_id(chain_id);
        let client = SignerMiddleware::new(provider.clone(), wallet.clone());
        let contract = contract.parse::<Address>()?;

        Ok(TxSender {
            chain_id,
            client,
            contract,
        })
    }

    /// Send a transaction with the given calldata.
    pub async fn send(&self, calldata: Vec<u8>) -> Result<Option<TransactionReceipt>> {
        let tx = TransactionRequest::new()
            .chain_id(self.chain_id)
            .to(self.contract)
            .from(self.client.address())
            .data(calldata);

        log::info!("Transaction request: {:?}", &tx);

        let tx = self.client.send_transaction(tx, None).await?.await?;

        log::info!("Transaction receipt: {:?}", &tx);

        Ok(tx)
    }
}

/// Arguments of the publisher CLI.
#[derive(Parser, Debug)]
#[clap(author, version, about, long_about = None)]
struct Args {
    /// Ethereum chain ID
    #[clap(long)]
    chain_id: u64,

    /// Ethereum Node endpoint.
    #[clap(long, env)]
    eth_wallet_private_key: String,

    /// Ethereum Node endpoint.
    #[clap(long)]
    rpc_url: String,

    /// Application's contract address on Ethereum
    #[clap(long)]
    contract: String,
}

const HEADER_XAUTH: &str = "X-Auth-Token";

async fn handle_jwt_authentication(token: String) -> Result<(), warp::Rejection> {
    if token.is_empty() {
        return Err(warp::reject::reject());
    }

    info!("Token received: {}", token);

    let args = Args::parse();

    // Log to capture the request
    info!("Processing JWT authentication");

    // Spawn a new thread for the Bonsai Prover computation
    prove_and_send_transaction(args, token).map_err(|_| warp::reject())
}

fn prove_and_send_transaction(args: Args, token: String) -> Result<()> {
    let tx_sender = TxSender::new(
        args.chain_id,
        &args.rpc_url,
        &args.eth_wallet_private_key,
        &args.contract,
    )
    .expect("failed to create new tx sender");

    let input = Input {
        identity_provider: U256::ZERO, // Google as the identity provider
        jwt: token,
    };
    let input = input.abi_encode();
    let env = ExecutorEnv::builder()
        .write_slice(&input)
        .build()
        .expect("Error building env");

    let receipt = default_prover()
        .prove_with_ctx(
            env,
            &VerifierContext::default(),
            JWT_VALIDATOR_ELF,
            &ProverOpts::groth16(),
        )
        .expect("failed to prove.")
        .receipt;

    // Encode the seal with the selector.
    let seal = groth16::encode(
        receipt
            .inner
            .groth16()
            .expect("failed to create groth16")
            .seal
            .clone(),
    )
    .expect("failed to clone seal");

    let journal = receipt.journal.bytes.clone();

    let claims: ClaimsData = <ClaimsData as SolValue>::abi_decode(&journal, true)
        .expect("failed to decode claims")
        .clone();

    let calldata = IBonsaiPay::IBonsaiPayCalls::claim(IBonsaiPay::claimCall {
        to: claims.msg_sender,
        claim_id: claims.claim_id,
        seal: seal.into(),
    })
    .abi_encode();

    // Initialize the async runtime environment to handle the transaction sending.
    let runtime = tokio::runtime::Runtime::new()?;

    // Send the calldata to Ethereum.
    runtime
        .block_on(tx_sender.send(calldata))
        .expect("failed to send tx");

    Ok(())
}

fn jwt_authentication_filter() -> impl Filter<Extract = ((),), Error = warp::Rejection> + Clone {
    warp::any()
        .and(warp::header::<String>(HEADER_XAUTH))
        .and_then(handle_jwt_authentication)
}

fn auth_filter() -> impl Filter<Extract = impl warp::Reply, Error = warp::Rejection> + Clone {
    let cors = warp::cors()
        .allow_any_origin()
        .allow_methods(vec!["GET", "POST", "DELETE"])
        .allow_headers(vec!["content-type", "x-auth-token"])
        .max_age(3600);

    warp::path("auth")
        .and(warp::get())
        .and(warp::path::end())
        .and(jwt_authentication_filter().untuple_one())
        .map(|| warp::reply())
        .with(cors)
}

#[tokio::main]
async fn main() {
    env_logger::init();

    let api = auth_filter();

    info!("Starting server at http://127.0.0.1:8080");

    warp::serve(api).run(([127, 0, 0, 1], 8080)).await;
}

