import Dotenv from "dotenv"
import { Bot, Context } from "grammy"
import { Fluent } from "@moebius/fluent"
import { FluentContextFlavor, useFluent } from "@grammyjs/fluent"
import Debug from "debug"
import utils from "./utils"
import Koa from "koa"
import Router from "koa-router"
import KoaBody from "koa-body"
import cors from "@koa/cors"
import func from "./func"

// Initialing
const print = Debug("tgwd:app.ts")

const fluent = new Fluent()
Dotenv.config()

const initialLocales = async () =>{
  await fluent.addTranslation({
    locales: "zh-hans",
    filePath: ["./locales/zh-hans/messages.ftl"]
  })
  await fluent.addTranslation({
    locales: "en",
    filePath: ["./locales/en/messages.ftl"]
  })
}
initialLocales()
export type BotContext = ( & Context & FluentContextFlavor )

if (!process.env.TGWD_TOKEN) {
  throw(new Error("You must define TGWD_TOKEN (Telegram bot token) to use this bot."))
}
if (!process.env.TGWD_FRONTEND_DOMAIN) {
  throw(new Error("You must define TGWD_FRONTEND_DOMAIN (Frontend verify domain) to use this bot."))
}
if (!process.env.TGWD_SECRET) {
  throw(new Error("You must define TGWD_SECRET (signature secret) to use this bot."))
}
if (!process.env.TGWD_PORT) {
  throw(new Error("You must define TGWD_PORT (endpoint port) to use this bot."))
}

// Bot part
const bot = new Bot<BotContext>(process.env.TGWD_TOKEN || "")

bot.use(useFluent({ fluent, defaultLocale: "en"}))

bot.command("start", async ctx => {
  await ctx.reply(ctx.t("welcome_body"), {
    disable_web_page_preview: true,
    reply_markup: {
      inline_keyboard: [[
        {
          text: ctx.t("welcome_setmeasadmin"),
          url: `https://t.me/${ctx.me.username}?startgroup=start&admin=can_invite_users`
        }
      ]]
    }
  })
})

bot.on("chat_join_request", async ctx => {
  const msg = await bot.api.sendMessage(ctx.from.id, `${ctx.t("verify_message", {groupname: ctx.chat.title})}\n${ctx.t("verify_loading")}`)
  const timestamp = new Date().getTime()
  const msgId = msg.message_id
  const signature = await utils.signature(msgId, ctx.chat.id, ctx.from.id, timestamp)
  const url = `https://${process.env.TGWD_FRONTEND_DOMAIN}/?chat_id=${ctx.chat.id}&msg_id=${msgId}&timestamp=${timestamp}&signature=${signature}`
  bot.api.editMessageText(
    ctx.from.id, msgId,
    `${ctx.t("verify_message", {groupname: ctx.chat.title})}\n${ctx.t("verify_info")}`,
    {
      reply_markup: {
        inline_keyboard: [[{
          text: ctx.t("verify_btn"),
          web_app: {
            url: url
          }
        }]]
      }
    }
  )
})

bot.catch(async err => {
  print("Error detected while running the bot!")
  print(err)
})

bot.start()

// HTTP Requests
const endpoint = new Koa()
endpoint.use(KoaBody())
endpoint.use(cors({
  origin: `https://${process.env.TGWD_FRONTEND_DOMAIN}`,
  allowMethods: ["POST", "GET", "OPTIONS"],
  allowHeaders: ["Content-Type"]
}))

const router = new Router()
router.get('/endpoints', async ctx => {
  ctx.response.body = JSON.stringify({
    hello: "world"
  })
})
router.post('/endpoints/verify-captcha', async ctx => {
  try {
    print("verify captcha")
    await func.verifyLogin()
    // const token = ctx.request.body.token
    // await func.verifyCaptcha()
    // const user_id = JSON.parse(ctx.request.body.tglogin.user).id
    
    // bot.telegram.approveChatJoinRequest(ctx.request.body.chat_id, user_id)
    ctx.response.status = 204
  } catch (e) {
    console.log(e)
    // const err = JSON.parse(e.message)
    ctx.response.status = 500
    ctx.response.body = { message: "服务器错误" }
  }
})
router.options('/endpoints/verify-captcha', async ctx => {
  ctx.response.status = 204
  ctx.response
})
endpoint.use(router.routes())
endpoint.listen(process.env.TGWD_PORT)