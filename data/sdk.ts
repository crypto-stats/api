import { CryptoStatsSDK } from '@cryptostats/sdk'

const sdk = new CryptoStatsSDK({
  ipfsGateway: 'https://ipfs.cryptostats.community',
  moralisKey: process.env.MORALIS_KEY,
})

export default sdk
