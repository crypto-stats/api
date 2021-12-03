import { CryptoStatsSDK } from '@cryptostats/sdk'

export function getSDK() {
  return new CryptoStatsSDK({
    ipfsGateway: 'https://ipfs.cryptostats.community',
    moralisKey: process.env.MORALIS_KEY,
    adapterListSubgraph: 'dmihal/cryptostats-adapter-registry-test',
  })
}
