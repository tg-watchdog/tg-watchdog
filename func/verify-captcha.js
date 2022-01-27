const { verify } = require('hcaptcha')

module.exports = async (token) => {
  try {
    let data = await verify("0x96Aa8DAd3095f4ff9548d47561b4c8533dd2F9E5", token)
    if (!data.success) {
      throw new Error(JSON.stringify({code: 400, message: '未能通过人机验证'}))
    }
  } catch(e) {
    console.log(e)
    throw new Error(JSON.stringify(e.message).code || JSON.stringify({code: 400, message: 'hCaptcha 服务器出现错误'}))
  }
}