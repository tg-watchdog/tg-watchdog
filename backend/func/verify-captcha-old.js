const axios = require('axios')

module.exports = async (solution) => {
  let data
  try {
    data = await axios.post(
      "https://api.friendlycaptcha.com/api/v1/siteverify",
      {
        solution,
        secret: process.env.TGWD_FCAPIKEY
      }
    )
  } catch(e) {
    console.log(e)
    throw new Error(JSON.stringify(e.message).code || JSON.stringify({code: 400, message: 'FriendlyCaptcha 服务器出现错误'}))
  }
  if (!data.data.success) {
    console.log(data)
    throw new Error(JSON.stringify({code: 400, message: '未能通过人机验证'}))
  }
}