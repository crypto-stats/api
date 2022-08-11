import { CryptoStatsSDK } from '@cryptostats/sdk'

export function getSDK() {
  const sdk = new CryptoStatsSDK({
    mongoConnectionString: process.env.MONGO_CONNECTION_STRING,
    redisConnectionString: process.env.REDIS_URL,
    moralisKey: process.env.MORALIS_KEY,
    executionTimeout: 60,
  });

  if (process.env.ALCHEMY_ETH_KEY) {
    const rpc = `https://eth-mainnet.alchemyapi.io/v2/${process.env.ALCHEMY_ETH_KEY}`
    sdk.ethers.addProvider('ethereum', rpc, { archive: true });
  } else {
    console.error('Alchemy key not set');
  }

  sdk.getCollection('fees').setCacheKeyResolver((_id: string, query: string, params: string[]) =>
    query === 'oneDayTotalFees' ? params[0] : null
  );

  sdk.getCollection('fees-range').setCacheKeyResolver((_id: string, query: string, params: string[]) =>
    query === 'dateRangeTotalFees' && params.length == 2 ? `${params[0]}-${params[1]}` : null
  );

  sdk
    .getCollection('rollup-l1-fees')
    .setCacheKeyResolver((_id: string, query: string, params: string[]) =>
      query === 'oneDayFeesPaidUSD' ? params[0] : null
    );

  return sdk;
}
