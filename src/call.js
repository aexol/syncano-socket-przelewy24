import Server from 'syncano-server'
import fetch from 'axios'
import {url, sign, call} from './utils'
import FormData from 'form-data'
export default async ctx => {
  try {
    const {response} = Server(ctx)
    let {MERCHANT_ID, CRC, TEST = 'false'} = ctx.config
    const fd = new FormData()
    const body = {
      p24_merchant_id: MERCHANT_ID,
      p24_pos_id: MERCHANT_ID,
      p24_sign: sign([MERCHANT_ID, CRC])
    }
    let resp = await (await call({
      url: `${url(ctx)}testConnection`,
      data: body
    })).text()
    return response.json(resp)
  } catch ({message}) {
    throw new Error(message)
  }
}
