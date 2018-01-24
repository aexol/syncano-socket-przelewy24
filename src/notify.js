import Server from '@syncano/core'
import {call, url} from './utils'
import queryString from 'query-string'
export default async ctx => {
  const {data, response, event} = new Server(ctx)
  try {
    const {
      p24_merchant_id,
      p24_pos_id,
      p24_session_id,
      p24_order_id,
      p24_amount,
      p24_currency,
      p24_sign
    } = ctx.args
    const transaction = await data.transaction
      .where('uuid', p24_session_id)
      .firstOrFail()
    const verify = await (await call({
      data: {
        p24_merchant_id,
        p24_pos_id,
        p24_session_id,
        p24_amount,
        p24_currency,
        p24_order_id,
        p24_sign
      },
      url: `${url(ctx)}trnVerify`
    })).text()
    console.log(`Verifiaction status: ${verify}`)
    const updatedTransaction = await data.transaction.update(transaction.id, {
      status: 'p'
    })
    event.emit('przelewy24_transaction_paid', {
      externalId: transaction.externalId
    })
    return response.json(updatedTransaction)
  } catch ({message}) {
    return response.json(message, 400)
  }
}
