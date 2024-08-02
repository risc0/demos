# CosmWasm verifier

### Running

Build image ID and receipt to verify:

```console
cd risc0-example
cargo run
```

Optionally set variables from the output files:

```console
read -x IMAGE_ID < ../factors_id.json
# read -x STARK_RECEIPT < ../stark-receipt.json
read -x SNARK_RECEIPT < ../snark-receipt.json
```


Install Wasmd and other dependencies (v0.52.0):

https://docs.cosmwasm.com/docs/getting-started/installation

(Optional) Initialize a wallet:

```console
wasm keys add wallet
```

Init network:

```
wasmd init localnet --chain-id localnet
wasmd genesis add-genesis-account $(wasmd keys show -a wallet) 10000000000uwasm,10000000000stake
wasmd genesis gentx wallet 10000000000stake --chain-id localnet
wasmd genesis collect-gentxs
wasmd genesis validate-genesis
wasmd start
```

Build the contract:

in `./cosmwasm/`

x86_64:

```console
docker run --rm -v "$(pwd)":/code \
  --mount type=volume,source="$(basename "$(pwd)")_cache",target=/target \
  --mount type=volume,source=registry_cache,target=/usr/local/cargo/registry \
  cosmwasm/optimizer:0.16.0
```

ARM:

```console
docker run --rm -v "$(pwd)":/code \
  --mount type=volume,source="$(basename "$(pwd)")_cache",target=/target \
  --mount type=volume,source=registry_cache,target=/usr/local/cargo/registry \
  cosmwasm/optimizer-arm64:0.16.0
```

Deploy contract:

```console
set -x RES $(wasmd tx wasm store artifacts/cosmwasm_verifier.wasm --from wallet --gas-prices 0.1uwasm --gas auto --gas-adjustment 2 -y --output json -b sync --node http://127.0.0.1:26657 --chain-id localnet)

# For bash:
export CODE_ID=$(wasmd query wasm list-code --output json | jq -r '.code_infos[0].code_id')

# Fish
set -x CODE_ID $(wasmd query wasm list-code --output json | jq -r '.code_infos[0].code_id')
```

Initialize contract:

```console
wasmd tx wasm instantiate $CODE_ID "{\"image_id\":$IMAGE_ID}" --from wallet --label "Initialize with image ID" --gas-prices 0.025uwasm --gas auto --gas-adjustment 2 -b sync -y --no-admin --chain-id localnet --node http://127.0.0.1:26657
```


Get contract address:

```console
set -x CONTRACT_ADDR $(wasmd query wasm list-contract-by-code $CODE_ID --output json --node http://127.0.0.1:26657 | jq -r '.contracts[0]')
```

Query the contract with a receipt:

```console
wasmd query wasm contract-state smart $CONTRACT_ADDR "{\"Verify\":{\"receipt\":$SNARK_RECEIPT}}" --output json --node http://127.0.0.1:26657
```

Sending a transaction verifying the receipt:

```console
wasmd tx wasm execute $CONTRACT_ADDR "{\"Verify\":{\"receipt\":$SNARK_RECEIPT}}" --from wallet --gas-prices 0.025uwasm --gas auto --gas-adjustment 1.3 -y --chain-id localnet --output json --node http://127.0.0.1:26657
```
