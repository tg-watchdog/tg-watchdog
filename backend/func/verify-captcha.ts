import axios from "axios"
import Debug from "debug"

const print = Debug("tgwd:func/verify-captcha.ts")

export default async (response: string): Promise<{ success: Boolean, error?: { code: number, alias: string } }> => {
  let data
  try {
    data = await axios({
      method: "POST",
      url: "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      data: `secret=${process.env.TGWD_CFTS_API_KEY ?? ""}&response=${response}`
    })
  } catch(e) {
    print(e)
    return {
      success: false,
      error: {
        code: 502,
        alias: "CAPTCHA_ERROR"
      }
    }
  }
  if (!data.data.success) {
    print(data.data)
    // throw new Error(JSON.stringify({code: 400, message: '未能通过人机验证'}))
    return { success: false, error: { code: 400, alias: "CAPTCHA_NOT_PASSED"} }
  }
  return { success: true }
}
