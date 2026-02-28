---
name: blockchain-api-docs
description: Reference documentation for Etherscan API V2 and Blockscout API. Use this skill when building features that query blockchain data - balances, transactions, token transfers, contract ABIs, gas prices, block info, etc. Covers both Etherscan (60+ EVM chains, single API key) and Blockscout (open-source, self-hosted explorers).
---

# Blockchain Explorer API Reference

Quick reference for Etherscan API V2 and Blockscout RPC/REST APIs. Both follow module+action query parameter patterns for their RPC-style endpoints.

---

## Etherscan API V2

### Base URL

```
https://api.etherscan.io/v2/api?chainid={CHAIN_ID}&module={MODULE}&action={ACTION}&apikey={API_KEY}
```

Single API key works across all 60+ supported chains. Switch chains by changing `chainid`.

### Authentication

- Pass `apikey` as a query parameter on every request
- Get a key at https://etherscan.io/myapikey

### Rate Limits

- **Free plan**: 5 calls/sec
- **Paid plans**: Higher limits (check https://etherscan.io/apis)
- Common error: `"Max rate limit reached"` - back off and retry

### Common Chain IDs

| Chain | ID | Chain | ID |
|---|---|---|---|
| Ethereum | 1 | Arbitrum One | 42161 |
| BNB Smart Chain | 56 | OP Mainnet | 10 |
| Polygon | 137 | Avalanche C-Chain | 43114 |
| Base | 8453 | Linea | 59144 |
| Sepolia Testnet | 11155111 | Blast | 81457 |
| Scroll | 534352 | Sonic | 146 |
| Berachain | 80094 | Monad | 143 |
| HyperEVM | 999 | MegaETH | 4326 |

Full list: https://docs.etherscan.io/supported-chains

---

### Account Module (`module=account`)

#### Get Native Balance

```
action=balance&address={ADDRESS}&tag=latest
```

| Param | Type | Required | Description |
|---|---|---|---|
| address | string | Yes | Wallet address. Up to 20 comma-separated addresses supported |
| tag | string | No | `latest` (default) or hex block number up to 128 blocks back |

Response: `result` is balance in **wei** (string).

```json
{"status":"1","message":"OK","result":"172774397764084972158218"}
```

#### Get Normal Transactions

```
action=txlist&address={ADDRESS}
```

| Param | Type | Default | Description |
|---|---|---|---|
| address | string | - | Target address |
| startblock | int | 0 | Start block number |
| endblock | int | 9999999999 | End block number |
| page | int | 1 | Page number |
| offset | int | 10 | Results per page |
| sort | string | desc | `asc` or `desc` |

Response: Array of transaction objects with `blockNumber`, `hash`, `from`, `to`, `value`, `gas`, `gasPrice`, `gasUsed`, `isError`, `timeStamp`, etc.

#### Get Internal Transactions

```
action=txlistinternal&address={ADDRESS}
```

Same pagination params as `txlist`. Returns internal (trace) transactions with `type`, `traceId`, `errCode`.

#### Get ERC-20 Token Transfers

```
action=tokentx&address={ADDRESS}
```

| Param | Type | Default | Description |
|---|---|---|---|
| address | string | - | Target address |
| contractaddress | string | - | Filter by specific token contract |
| startblock | int | 0 | Start block |
| endblock | int | 9999999999 | End block |
| page | int | 1 | Page |
| offset | int | 10 | Results per page |
| sort | string | desc | `asc` or `desc` |

Response includes `tokenName`, `tokenSymbol`, `tokenDecimal`, `from`, `to`, `value`, `hash`.

#### Get ERC-721 Token Transfers

```
action=tokennfttx&address={ADDRESS}
```

Same params as `tokentx`. Returns NFT transfers with `tokenID`.

#### Get ERC-1155 Token Transfers

```
action=token1155tx&address={ADDRESS}
```

Same params as `tokentx`. Returns multi-token transfers with `tokenID` and `tokenValue`.

---

### Contract Module (`module=contract`)

#### Get Contract ABI

```
action=getabi&address={CONTRACT_ADDRESS}
```

Response: `result` is the ABI as a JSON string. Only works for **verified** contracts.

Available on **all chains** for **all API plans** including Free Tier.

#### Get Contract Source Code

```
action=getsourcecode&address={CONTRACT_ADDRESS}
```

Response includes: `SourceCode`, `ABI`, `ContractName`, `CompilerVersion`, `OptimizationUsed`, `Runs`, `EVMVersion`, `LicenseType`, `Proxy`.

Available on **all chains** for **all API plans** including Free Tier.

#### Get Contract Creator

```
action=getcontractcreation&contractaddresses={ADDRESS1,ADDRESS2}
```

Returns `contractAddress`, `contractCreator`, `txHash`.

---

### Stats Module (`module=stats`)

#### Get Ether Last Price

```
action=ethprice
```

Response:

```json
{
  "result": {
    "ethbtc": "0.03683",
    "ethbtc_timestamp": "1710000000",
    "ethusd": "4129.31",
    "ethusd_timestamp": "1710000000"
  }
}
```

#### Get Total Supply

```
action=ethsupply
```

Response: Total supply in wei.

---

### Gas Tracker Module (`module=gastracker`)

#### Get Gas Oracle

```
action=gasoracle
```

Response:

```json
{
  "result": {
    "LastBlock": "19400000",
    "SafeGasPrice": "15",
    "ProposeGasPrice": "18",
    "FastGasPrice": "22",
    "suggestBaseFee": "14.5",
    "gasUsedRatio": "0.45,0.62,0.38,0.55,0.48"
  }
}
```

#### Get Estimation of Confirmation Time

```
action=gasestimate&gasprice={WEI_PRICE}
```

Response: Estimated seconds for confirmation.

---

### Block Module (`module=block`)

#### Get Block Number by Timestamp

```
action=getblocknobytime&timestamp={UNIX_TIMESTAMP}&closest=before
```

| Param | Type | Description |
|---|---|---|
| timestamp | int | Unix timestamp in seconds |
| closest | string | `before` or `after` |

Response: Block number as string.

#### Get Block Rewards

```
action=getblockreward&blockno={BLOCK_NUMBER}
```

---

### Logs Module (`module=logs`)

#### Get Event Logs

```
action=getLogs&address={ADDRESS}&fromBlock={FROM}&toBlock={TO}
```

| Param | Type | Description |
|---|---|---|
| address | string | Contract address |
| fromBlock | int | Start block |
| toBlock | int | End block (or `latest`) |
| topic0 | string | Event signature hash |
| topic1-3 | string | Indexed parameters |
| topic0_1_opr | string | `and` or `or` operator between topics |

---

### Proxy Module (JSON-RPC via Etherscan)

These mirror standard Ethereum JSON-RPC methods:

```
module=proxy&action=eth_blockNumber
module=proxy&action=eth_getBlockByNumber&tag=0x10d4f&boolean=true
module=proxy&action=eth_getTransactionByHash&txhash={HASH}
module=proxy&action=eth_getTransactionReceipt&txhash={HASH}
module=proxy&action=eth_call&to={ADDRESS}&data={DATA}&tag=latest
module=proxy&action=eth_getCode&address={ADDRESS}&tag=latest
module=proxy&action=eth_getStorageAt&address={ADDRESS}&position=0x0&tag=latest
module=proxy&action=eth_gasPrice
module=proxy&action=eth_estimateGas&to={ADDRESS}&data={DATA}&value={VALUE}&gas={GAS}
module=proxy&action=eth_getTransactionCount&address={ADDRESS}&tag=latest
module=proxy&action=eth_sendRawTransaction&hex={SIGNED_TX}
```

---

### Token Module (`module=token`)

#### Get Token Info

```
action=tokeninfo&contractaddress={TOKEN_ADDRESS}
```

#### Get Token Supply

```
action=tokensupply&contractaddress={TOKEN_ADDRESS}
```

#### Get Token Holder Count

```
action=tokenholdercount&contractaddress={TOKEN_ADDRESS}
```

#### Get Top Token Holders

```
action=toptokenholders&contractaddress={TOKEN_ADDRESS}&page=1&offset=10
```

#### Get Token Balance

```
module=account&action=tokenbalance&contractaddress={TOKEN}&address={HOLDER}&tag=latest
```

---

### Full Endpoint Index

For the complete list of all endpoints: https://docs.etherscan.io/llms.txt

---

## Blockscout API

Blockscout is an open-source block explorer. Each chain runs its own instance with its own base URL.

### Popular Instances

| Chain | Base URL |
|---|---|
| Ethereum | https://eth.blockscout.com |
| Gnosis | https://gnosis.blockscout.com |
| Optimism | https://optimism.blockscout.com |
| Base | https://base.blockscout.com |

Full list: https://docs.blockscout.com/about/chains

### Two API Styles

Blockscout offers two APIs:

1. **RPC API** (Etherscan-compatible) - `{instance}/api?module=...&action=...`
2. **REST API v2** - `{instance}/api/v2/...`

Swagger docs for any instance: `{instance}/api-docs`

---

### RPC API (Etherscan-Compatible)

Base URL: `{instance}/api`

Supports GET and POST. Uses the same module+action pattern as Etherscan, making migration straightforward.

#### Available Modules

| Module | Description |
|---|---|
| `account` | Balances, transactions, token transfers |
| `block` | Block info, rewards, countdown |
| `contract` | ABI, source code, verification |
| `logs` | Event logs by address/topics |
| `stats` | Coin price, supply, network stats |
| `token` | Token info, holders |
| `transaction` | Execution status, receipt status |

#### Account Examples

```
# Native balance
?module=account&action=balance&address={ADDRESS}

# Multi-address balance
?module=account&action=balancemulti&address={ADDR1},{ADDR2}

# Transaction list
?module=account&action=txlist&address={ADDRESS}&startblock=0&endblock=99999999&sort=asc

# Internal transactions
?module=account&action=txlistinternal&address={ADDRESS}

# ERC-20 transfers
?module=account&action=tokentx&address={ADDRESS}&contractaddress={TOKEN}

# ERC-721 transfers
?module=account&action=tokennfttx&address={ADDRESS}

# ERC-1155 transfers
?module=account&action=token1155tx&address={ADDRESS}

# Token balance
?module=account&action=tokenbalance&contractaddress={TOKEN}&address={HOLDER}

# List accounts with balances
?module=account&action=listaccounts&page=1&offset=10

# Pending transactions
?module=account&action=pendingtxlist&address={ADDRESS}

# Blocks mined by address
?module=account&action=getminedblocks&address={ADDRESS}
```

#### Contract Examples

```
# Get ABI
?module=contract&action=getabi&address={ADDRESS}

# Get source code
?module=contract&action=getsourcecode&address={ADDRESS}

# Get contract creator
?module=contract&action=getcontractcreation&contractaddresses={ADDR1},{ADDR2}

# Verify source code
?module=contract&action=verifysourcecode (POST with source code params)

# Check verification status
?module=contract&action=checkverifystatus&guid={GUID}

# Verify proxy
?module=contract&action=verifyproxycontract&address={ADDRESS}
```

#### Block Examples

```
# Block by timestamp
?module=block&action=getblocknobytime&timestamp={UNIX}&closest=before

# Block reward
?module=block&action=getblockreward&blockno={NUMBER}

# Block countdown
?module=block&action=getblockcountdown&blockno={FUTURE_BLOCK}

# Latest block (JSON-RPC style)
?module=block&action=eth_block_number
```

#### Stats Examples

```
# Coin price
?module=stats&action=coinprice

# Token supply
?module=stats&action=tokensupply&contractaddress={TOKEN}

# Coin supply
?module=stats&action=coinsupply

# Total transaction fees
?module=stats&action=totalfees&date=2024-01-01
```

#### Logs Examples

```
# By address + block range
?module=logs&action=getLogs&address={ADDRESS}&fromBlock=0&toBlock=latest

# With topics
?module=logs&action=getLogs&address={ADDRESS}&topic0={HASH}&fromBlock=0&toBlock=latest
```

---

### REST API v2

Base URL: `{instance}/api/v2`

More feature-rich than the RPC API. Uses standard REST conventions.

#### Pagination

Uses **keyset pagination** (not offset-based):
- Default: 50 results per request
- Response includes `next_page_params` object
- Pass those params to get the next page

Example:
```
GET /api/v2/transactions
Response includes: { "next_page_params": { "block_number": 18678766, "index": 119, "items_count": 50 } }

GET /api/v2/transactions?block_number=18678766&index=119&items_count=50
```

#### Key Endpoints

**Transactions**
```
GET /api/v2/transactions                              # List transactions
GET /api/v2/transactions/{hash}                       # Transaction details
GET /api/v2/transactions/{hash}/logs                  # Transaction logs
GET /api/v2/transactions/{hash}/state-changes         # State changes
GET /api/v2/transactions/{hash}/raw-trace             # Raw trace
GET /api/v2/transactions/{hash}/summary               # Human-readable summary
```

**Addresses**
```
GET /api/v2/addresses/{hash}                          # Address details
GET /api/v2/addresses/{hash}/transactions             # Address transactions
GET /api/v2/addresses/{hash}/internal-transactions    # Internal txs
GET /api/v2/addresses/{hash}/token-transfers          # Token transfers
GET /api/v2/addresses/{hash}/tokens                   # Token balances
GET /api/v2/addresses/{hash}/logs                     # Address logs
GET /api/v2/addresses/{hash}/coin-balance-history     # Balance history
GET /api/v2/addresses/{hash}/coin-balance-history-by-day  # Daily balance
GET /api/v2/addresses/{hash}/counters                 # Tx/token counts
GET /api/v2/addresses/{hash}/nft                      # NFTs owned (grouped)
GET /api/v2/addresses/{hash}/nft/collections          # NFT collections
GET /api/v2/addresses/{hash}/withdrawals              # Beacon withdrawals
```

**Blocks**
```
GET /api/v2/blocks                                    # List blocks
GET /api/v2/blocks/{number_or_hash}                   # Block details
```

**Tokens**
```
GET /api/v2/tokens                                    # Token list
GET /api/v2/tokens/{hash}                             # Token info
GET /api/v2/tokens/{hash}/transfers                   # Token transfers
GET /api/v2/tokens/{hash}/holders                     # Token holders
GET /api/v2/tokens/{hash}/instances                   # NFT instances
GET /api/v2/tokens/{hash}/instances/{id}              # NFT instance detail
GET /api/v2/tokens/{hash}/instances/{id}/transfers    # NFT instance transfers
```

**Smart Contracts**
```
GET /api/v2/smart-contracts                           # Verified contracts list
GET /api/v2/smart-contracts/{hash}                    # Contract info
GET /api/v2/smart-contracts/counters                  # Verification counters
```

**Stats**
```
GET /api/v2/stats                                     # Network statistics
GET /api/v2/stats/counters                            # Chain counters
GET /api/v2/stats/charts/market                       # Market chart
GET /api/v2/stats/charts/transactions                 # Transaction chart
```

**Main Page**
```
GET /api/v2/main-page/blocks                          # Latest blocks
GET /api/v2/main-page/transactions                    # Latest transactions
GET /api/v2/main-page/indexing-status                 # Indexing status
```

**Search**
```
GET /api/v2/search?q={query}                          # Search addresses/txs/tokens
GET /api/v2/search/check-redirect?q={query}           # Check if query redirects
```

**Misc**
```
GET /api/v2/withdrawals                               # Beacon withdrawals
GET /api/v2/native-coin-holders                       # Native coin holders
GET /api/v2/json-rpc-url                              # JSON RPC URL
```

---

### Rate Limits (Blockscout)

| API Key Type | Rate Limit |
|---|---|
| No API key (by IP) | 5 req/sec (300/min) |
| Temporary token (after CAPTCHA) | 5 req/sec |
| Individual API key | 10 req/sec |
| Whitelisted IP | 25 req/sec |

Stricter limits on certain endpoints:
- CSV exports: 50 req/hour
- Auth endpoints: 1 req/hour

---

### Blockscout ETH JSON-RPC

Base URL: `{instance}/api/eth-rpc`

Standard Ethereum JSON-RPC methods:

```
eth_blockNumber
eth_getBalance(address, block)
eth_getBlockByNumber(block, full_tx)
eth_getBlockByHash(hash, full_tx)
eth_getTransactionByHash(hash)
eth_getTransactionReceipt(hash)
eth_getTransactionCount(address, block)
eth_getLogs(filter)
eth_call(tx, block)
eth_estimateGas(tx)
eth_gasPrice
eth_maxPriorityFeePerGas
eth_getCode(address, block)
eth_getStorageAt(address, position, block)
eth_sendRawTransaction(data)
eth_chainId
```

---

## Response Format Comparison

### Etherscan

```json
{
  "status": "1",
  "message": "OK",
  "result": "..."
}
```

`status: "1"` = success, `status: "0"` = error. `result` contains the data (string, array, or object).

### Blockscout RPC API

Same format as Etherscan (designed for compatibility):

```json
{
  "status": "1",
  "message": "OK",
  "result": "..."
}
```

### Blockscout REST API v2

Standard REST responses with JSON bodies. Uses HTTP status codes. Paginated responses include `next_page_params`.

---

## Quick Reference: Common Tasks

| Task | Etherscan | Blockscout RPC | Blockscout REST |
|---|---|---|---|
| Get balance | `module=account&action=balance` | Same | `GET /api/v2/addresses/{addr}` |
| List txs | `module=account&action=txlist` | Same | `GET /api/v2/addresses/{addr}/transactions` |
| Token transfers | `module=account&action=tokentx` | Same | `GET /api/v2/addresses/{addr}/token-transfers` |
| Contract ABI | `module=contract&action=getabi` | Same | `GET /api/v2/smart-contracts/{addr}` |
| Gas price | `module=gastracker&action=gasoracle` | `module=proxy&action=eth_gasPrice` | `GET /api/v2/stats` |
| Block by time | `module=block&action=getblocknobytime` | Same | N/A |
| Event logs | `module=logs&action=getLogs` | Same | `GET /api/v2/addresses/{addr}/logs` |
| Token info | `module=token&action=tokeninfo` | `module=token&action=getToken` | `GET /api/v2/tokens/{addr}` |
| ETH price | `module=stats&action=ethprice` | `module=stats&action=coinprice` | `GET /api/v2/stats` |

---

## Further Reading

- Etherscan full docs index: https://docs.etherscan.io/llms.txt
- Blockscout full docs index: https://docs.blockscout.com/llms.txt
- Blockscout Swagger (per instance): `{instance}/api-docs`
- Blockscout SDK: https://docs.blockscout.com/devs/blockscout-sdk
- Blockscout MCP Server: https://docs.blockscout.com/devs/mcp-server
