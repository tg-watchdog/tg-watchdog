const { Telegraf } = require('telegraf')
const Koa = require('koa')
const koaBody = require('koa-body')
const safeCompare = require('safe-compare')
const router = require('koa-router')()

const func = require('./func')

// Bots
const token = process.env.BOT_TOKEN
if (token === undefined) {
  throw new Error('BOT_TOKEN must be provided!')
}
const bot = new Telegraf(token)
const secretPath = `/${process.env.SECRET}`
bot.telegram.setWebhook(`https://${process.env.DOMAIN}/${process.env.SECRET}`)

bot.start((ctx) => ctx.reply('Welcome'))
bot.on('chat_join_request', async ctx => {
  try {
    if (ctx.chat.id !== process.env.CHAT_ID) {
      return
    }
    ctx.telegram.sendMessage(
      ctx.from.id,
      `你好，我是群组 ${ctx.chat.title} 的看门狗 🐶！\n你需要完成人机验证才能入群。点击以下链接，到浏览器完成验证。`,
      {
        reply_markup: {
          inline_keyboard: [[{
            text: `开始验证`,
            login_url: {
              url: `https://tgwatchdogvue.dev.astrianzheng.com`,
              request_write_access: true
            }
          }]]
        }
      }
    )
  } catch (e) {
    await ctx.reply('Something has gone wrong!!')
  }
})
bot.command('/chatid', async ctx => {
  ctx.reply(`本会话的 ID：${ctx.chat.id}`)
})


// Website & API
const app = new Koa()
app.use(koaBody())
app.use(async (ctx, next) => {
  ctx.set("Access-Control-Allow-Origin", process.env.FRONTEND_ADDRESS)
  await next()
})

router.get('/', async ctx => {
  ctx.response.body = JSON.stringify({
    hello: "world"
  })
})
router.post('/verify-captcha', async ctx => {
  try {
    func.verify_login(ctx.request.body.tglogin)
    console.log("tglogin completed")
    const token = ctx.request.body.token
    await func.verify_captcha(token)
    ctx.response.status = 204
    bot.telegram.approveChatJoinRequest(process.env.CHAT_ID, ctx.request.body.tglogin.id)
  } catch (e) {
    console.log(e)
    const err = JSON.parse(e.message)
    ctx.response.status = err.code || 500
    ctx.response.body = { message: err.message || "服务器错误" }
  }
})

// Koa config
app.use(router.routes())
app.use(async (ctx, next) => {
  if (safeCompare(secretPath, ctx.url)) {
    await bot.handleUpdate(ctx.request.body)
    ctx.status = 204
    return
  }
  return next()
})
app.listen(process.env.PORT)