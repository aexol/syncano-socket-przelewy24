import md5 from 'md5'
import fetch from 'node-fetch'
import FormData from 'form-data'
export const sign = args => {
  return md5(args.join('|'))
}
export const url = ctx => {
  const {TEST} = ctx.config
  return TEST === 'false'
    ? `https://secure.przelewy24.pl/`
    : `https://sandbox.przelewy24.pl/`
}
export const call = ({data, url, method = 'POST'}) => {
  let fd = new FormData()
  Object.keys(data).reduce((a, b) => {
    if (data[b]) {
      fd.append(b, data[b])
    }
    return fd
  })
  return fetch(url, {
    method,
    compress: false,
    body: fd
  })
}
