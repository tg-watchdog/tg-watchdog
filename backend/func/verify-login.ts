import Debug from "debug"
import crypto from "crypto"
import Dotenv from "dotenv"

const print = Debug("tgwd:func/verify-login.ts")
Dotenv.config()

export default async (inputData: TGLogin, bottoken: string): Promise<Boolean> => {
  const secret = crypto.createHmac('sha256', "WebAppData").update(bottoken).digest()
  print(process.env.BOT_TOKEN)
  const {hash, ...data} = inputData
  const checkString = Object.keys(data)
    .sort()
    .map(k => (`${k}=${data[k]}`))
    .join('\n')
  print(checkString)
  const hmac = crypto.createHmac('sha256', secret)
    .update(checkString)
    .digest('hex')
  print(hmac)
  return hmac === hash
}