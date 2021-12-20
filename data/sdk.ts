import { CryptoStatsSDK } from '@cryptostats/sdk'

export function getSDK() {
  const sdk = new CryptoStatsSDK({
    mongoConnectionString: process.env.MONGO_CONNECTION_STRING,
    redisConnectionString: process.env.REDIS_URL,
    moralisKey: process.env.MORALIS_KEY,
  })

  sdk.getList('fees').setCacheKeyResolver((_id: string, query: string, params: string[]) =>
    query === 'oneDayTotalFees' ? params[0] : null
  );

  sdk.getList('fees-range').setCacheKeyResolver((_id: string, query: string, params: string[]) =>
    query === 'dateRangeTotalFees' && params.length == 2 ? `${params[0]}-${params[1]}` : null
  );

  return sdk
}
