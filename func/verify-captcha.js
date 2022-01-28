const { verify } = require('hcaptcha')

module.exports = async (token) => {
  try {
    let data = await verify(process.env.CAPTCHA_SECRET, token)
    if (!data.success) {
      throw new Error(JSON.stringify({code: 400, message: '未能通过人机验证'}))
    }
  } catch(e) {
    console.log(e)
    throw new Error(JSON.stringify(e.message).code || JSON.stringify({code: 400, message: 'hCaptcha 服务器出现错误'}))
  }
}