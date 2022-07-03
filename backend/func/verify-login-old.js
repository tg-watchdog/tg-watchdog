const { createHash, createHmac } = require('crypto')

module.exports = (data) => {
  if (!checkSignature(data)) {
    throw new Error(JSON.stringify({code: 400, message: 'Telegram 登录信息不正确'}))
  }
}

function checkSignature ({ hash, ...data }) {
  const secret = createHmac('sha256', "WebAppData").update(process.env.TGWD_TOKEN).digest()
  const checkString = Object.keys(data)
    .sort()
    .map(k => (`${k}=${data[k]}`))
    .join('\n');
  const hmac = createHmac('sha256', secret)
    .update(checkString)
    .digest('hex');
  return hmac === hash;
}