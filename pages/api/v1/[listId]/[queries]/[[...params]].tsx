import { NextApiRequest, NextApiResponse } from 'next'
import { Adapter } from '@cryptostats/sdk'
import { getSDK } from 'data/sdk'

// /api/v1/apy/currentAPY,averageAPY3Day/0x1234
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const sdk = getSDK()
    const { listId, queries, params } = req.query

    const list = sdk.getList(listId.toString())
    await list.fetchAdapters()

    const queryList = queries.toString().split(',')
    const paramList = params ? params.toString().split(',') : []

    const data = await Promise.all(list.getAdapters().map(async (adapter: Adapter) => {
      const [metadata, ...resultsList] = await Promise.all([
        adapter.getMetadata(),
        ...queryList.map(query => adapter.query(query, ...paramList)),
      ])

      const results: { [query: string]: any } = {}
      queryList.forEach((type: string, index: number) => {
        results[type] = resultsList[index]
      });

      return {
        id: adapter.id,
        results,
        metadata,
        // bundle,
      }
    }))

    res.setHeader('Cache-Control', `max-age=0, s-maxage=${60}`);
    res.json({
      success: true,
      data,
    })
  } catch (e) {
    console.error(e)
    res.status(500).json({
      success: false,
      error: e.message,
    })
  }
}

export default handler
