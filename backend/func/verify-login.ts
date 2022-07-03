import Debug from "debug"
import crypto from "crypto"

const print = Debug("tgwd:func/verify-login.ts")

export default async (inputData: TGLogin): Promise<Boolean> => {
  const secret = crypto.createHmac('sha256', "WebAppData").update(process.env.BOT_TOKEN || "").digest()
  const {hash, ...data} = inputData
  const checkString = Object.keys(data)
    .sort()
    .map(k => (`${k}=${data[k]}`))
    .join('\n')
  const hmac = crypto.createHmac('sha256', secret)
    .update(checkString)
    .digest('hex')
  return hmac === hash
}