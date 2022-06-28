import crypto from "crypto"
import Debug from "debug"

const print = Debug("tgwd:utils/signature.ts")

export default async (msgId: number, chatId: number, userId: number, joinTime: number): Promise<string> => {
  let signOri = `${msgId}${chatId}${userId}${joinTime}`
  signOri = Array.from(signOri).sort().join("")
  const sign = crypto.createHmac("sha256", process.env.TGWD_SECRET || "").update(signOri).digest("hex")
  return sign
}