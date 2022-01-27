const hcaptcha = require('hcaptcha')

exports.default = async (token) => {
  try {
    await hcaptcha("0x96Aa8DAd3095f4ff9548d47561b4c8533dd2F9E5", token)
  } catch(e) {
    console.log(e)
  }
}