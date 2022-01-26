const config = JSON.parse(process.env.TGWATCHDOG)

const { Telegraf } = require('telegraf')
const Koa = require('koa')
const koaBody = require('koa-body')
const safeCompare = require('safe-compare')
const router = require('koa-router')()

// Bots
const token = process.env.BOT_TOKEN
if (token === undefined) {
  throw new Error('BOT_TOKEN must be provided!')
}
const bot = new Telegraf(config.token)
bot.start((ctx) => ctx.reply('Welcome'))
const secretPath = `/${config.secret}`
bot.telegram.setWebhook(`${config.domain}/${config.secret}`)


router.get('/', async ctx => {
  console.log("test")
})

// Website & bot intergration
const app = new Koa()
app.use(koaBody())
app.use(router.routes())
app.use(async (ctx, next) => {
  if (safeCompare(secretPath, ctx.url)) {
    await bot.handleUpdate(ctx.request.body)
    ctx.status = 204
    return
  }
  return next()
})
app.listen(3722)