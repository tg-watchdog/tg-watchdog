const { verify } = require('hcaptcha')

module.exports = async (token) => {
  try {
    let data = await verify("0x96Aa8DAd3095f4ff9548d47561b4c8533dd2F9E5", token)
    
  } catch(e) {
    console.log(e)
    throw new Error(JSON.stringify({code: 400, message: 'hCaptcha 服务器出现错误'}))
  }
}