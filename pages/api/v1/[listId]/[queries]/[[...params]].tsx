import { NextApiRequest, NextApiResponse } from 'next'
import { Adapter } from '@cryptostats/sdk'
import { getSDK } from 'data/sdk'

// /api/v1/apy/currentAPY,averageAPY3Day/0x1234
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  )

  if (req.method == 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET')
    return res.status(200).end(null)
  }

  try {
    const sdk = getSDK()
    const { listId, queries, params, metadata: includeMetadata } = req.query

    const list = sdk.getList(listId.toString())
    await list.fetchAdapters()

    const queryList = queries.toString().split(',')
    const paramList = params ? params.toString().split(',') : []

    const data = await Promise.all(list.getAdapters().map(async (adapter: Adapter) => {
      const [metadata, ...resultsList] = await Promise.all([
        includeMetadata === 'false' ? Promise.resolve(null) : adapter.getMetadata(),
        ...queryList.map(query => adapter.query(query, ...paramList, { allowMissingQuery: true } )
          .catch((e: Error) => ({ error: e.message }))
        ),
      ])

      const results: { [query: string]: any } = {}
      const errors: { [query: string]: any } = {}

      queryList.forEach((type: string, index: number) => {
        const result = resultsList[index]
        if (result.error) {
          results[type] = null
          errors[type] = result.error
        } else {
          results[type] = result
        }
      });

      const result: any = {
        id: adapter.id,
        bundle: adapter.bundle,
        results,
        metadata,
      }

      if (Object.values(errors).length > 0) {
        result.errors = errors
      }

      return result
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
