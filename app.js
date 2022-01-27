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
    // Verify that the user is in the database of verified users
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
    // await verifyUser(ctx.from.id)
    // Approve join request
    /* await ctx.approveChatJoinRequest(ctx.chat.id, ctx.from.id)
    await ctx.reply(
      'You are welcome to our exclusive group,'
        + 'now you can chat with other members of the group'
    ) */
  } catch (e) {
    await ctx.reply('Something has gone wrong!!')
  }
})


// Website & API
const app = new Koa()
app.use(koaBody())
app.use(async (ctx, next) => {
  ctx.set("Access-Control-Allow-Origin", "*")
  await next()
})

router.get('/', async ctx => {
  ctx.response.body = JSON.stringify({
    hello: "world"
  })
})
router.post('/verify-captcha', async ctx => {
  console.log(ctx.request.body)
})

router.post('/verify-login', async ctx => {
  try {
    func.verify_login(ctx.request.body)
    ctx.response.status = 204
  } catch(e) {
    e = JSON.parse(e.message)
    ctx.response.status = e.code || 500
    ctx.response.body = { message: e.message || "服务器错误" }
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