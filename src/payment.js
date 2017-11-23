import Server from 'syncano-server'
import {url, sign, call} from './utils'
import uuid from 'uuid/v4'
import queryString from 'query-string';

export default async ctx => {
  try {
    const {response, data} = Server(ctx)
    let {
      MERCHANT_ID,
      CRC,
      TEST = 'false',
      CURRENCY_CODE: p24_currency
    } = ctx.config
    const {
      externalId,
      email: p24_email,
      description: p24_description,
      amount: p24_amount,
      country = 'pl',
      products,
      name: p24_client,
      address: p24_adress,
      postCode: p24_zip,
      city: p24_city,
      returnUrl: p24_url_return,
      statusUrl = `https://${ctx.meta.instance}.syncano.space/przelewy24/notify/`
    } = ctx.args
    const productsArray = products
      .map((p, i) => ({
        [`p24_name_${i}`]: p.name,
        [`p24_description_${i}`]: p.description,
        [`p24_quantity_${i}`]: p.quantity,
        [`p24_price_${i}`]: p.price,
        [`p24_number_${i}`]: p.number
      }))
      .reduce((a, b) => ({...a, ...b}), {})
    const p24_session_id = uuid()
    const body = {
      p24_merchantId: MERCHANT_ID,
      p24_merchant_id: MERCHANT_ID,
      p24_pos_id: MERCHANT_ID,
      p24_session_id,
      p24_amount,
      p24_currency,
      p24_description,
      p24_email,
      p24_url_return,
      p24_url_status: statusUrl,
      p24_client,
      p24_adress,
      p24_zip,
      p24_city,
      p24_country: country,
      p24_api_version: '3.2',
      ...productsArray,
      p24_sign: sign([
        p24_session_id,
        MERCHANT_ID,
        p24_amount,
        p24_currency,
        CRC
      ])
    }
    console.log("BODY",body)
    const transaction = await data.transaction.create({
      externalId,
      uuid: p24_session_id,
      amount: p24_amount,
      status:"c"
    })
    let resp = await (await call({
      url: `${url(ctx)}trnRegister`,
      data: body
    })).text()
    const convertedResponse = queryString.parse(resp)
    return response.json({...convertedResponse,url:`${url(ctx)}trnRequest/${convertedResponse.token}`})
  } catch ({message}) {
    throw new Error(message)
  }
}
