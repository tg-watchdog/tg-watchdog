/// <reference path = "types.d.ts" /> 
import Dotenv from "dotenv"
import { Bot, Context } from "grammy"
import { Fluent } from "@moebius/fluent"
import { FluentContextFlavor, useFluent } from "@grammyjs/fluent"
import Debug from "debug"
import Koa from "koa"
import Router from "koa-router"
import KoaBody from "koa-body"
import func from "./func"
import cors from "@koa/cors"


// Initialing
const print = Debug("tgwd:app.ts")

const fluent = new Fluent()
Dotenv.config()

const initialLocales = async () =>{
  await fluent.addTranslation({
    locales: "zh_Hans",
    filePath: ["./locales/zh-Hans/messages.ftl"]
  })
  await fluent.addTranslation({
    locales: "en",
    filePath: ["./locales/en/messages.ftl"],
    isDefault: true
  })
  await fluent.addTranslation({
    locales: "zh_Hant",
    filePath: ["./locales/zh-Hant/messages.ftl"]
  })
  await fluent.addTranslation({
    locales: "zh_Hant_HK",
    filePath: ["./locales/zh_HK/messages.ftl"]
  })
  await fluent.addTranslation({
    locales: "ja",
    filePath: ["./locales/ja/messages.ftl"]
  })
  await fluent.addTranslation({
    locales: "ru",
    filePath: ["./locales/ru/messages.ftl"]
  })
}
(async () => { await initialLocales() })()

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
if (!process.env.TGWD_CFTS_API_KEY) {
  throw(new Error("You must define TGWD_CFTS_API_KEY (Cloudflare Turnstile API key) to use this bot."))
}

// Bot part
const bot = new Bot<BotContext>(process.env.TGWD_TOKEN || "");

(async () => { bot.use(useFluent({ fluent, defaultLocale: "en"})) })();

(async () => {
  bot.command("start", async ctx => {
    await ctx.reply(
      `${ctx.t("welcome_body")}\n${ctx.t("welcome_links_github")} · ${ctx.t("welcome_links_help")} · ${ctx.t("welcome_links_community")} · ${ctx.t("welcome_links_channel")}\n\n${ctx.t("helpbot")}`,
      {
        disable_web_page_preview: true,
        reply_markup: {
          inline_keyboard: [[
            {
              text: ctx.t("welcome_setmeasadmin"),
              url: `https://t.me/${ctx.me.username}?startgroup=start&admin=can_invite_users`
            }
          ]]
        },
        parse_mode: "HTML"
      }
    )
  })
})();

(async () => {
  bot.on("chat_join_request", async ctx => {
    const msg = await bot.api.sendMessage(ctx.from.id, `${ctx.t("verify_message", {groupname: ctx.chat.title})}\n${ctx.t("verify_loading")}`)
    const timestamp = new Date().getTime()
    const msgId = msg.message_id
    const signature = await func.signature(msgId, ctx.chat.id, ctx.from.id, timestamp)
    const url = `https://${process.env.TGWD_FRONTEND_DOMAIN}/?chat_id=${ctx.chat.id}&msg_id=${msgId}&timestamp=${timestamp}&signature=${signature}`
    print(url)
    await bot.api.editMessageText(
      ctx.from.id, msgId,
      `${ctx.t("verify_message", {groupname: ctx.chat.title})}\n${ctx.t("verify_info")}\n\n${ctx.t("helpbot")}`,
      {
        disable_web_page_preview: true,
        reply_markup: {
          inline_keyboard: [[{
            text: ctx.t("verify_btn"),
            web_app: {
              url: url
            }
          }]]
        },
        parse_mode: "HTML"
      }
    )
  })
})();

(async () => { bot.catch(async err => {
  print("Error detected while running the bot!")
  print(err)
}) })();

(async () => { await bot.command("language", async ctx => {
  await ctx.reply(ctx.message?.from.language_code || "No language code detected")
}) })();

(async () => { await bot.start() })()

// HTTP Requests
const endpoint = new Koa()
endpoint.use(KoaBody())
endpoint.use(cors({
  origin: `https://${process.env.TGWD_FRONTEND_DOMAIN ?? ""}`,
}))

const router = new Router()
router.get('/endpoints', async ctx => {
  print(await func.signature(44, -1001320638783, 54785179, 1656425097585))
  ctx.response.body = JSON.stringify({
    hello: "world"
  })
  print(process.env.TGWD_FRONTEND_DOMAIN)
})
router.post('/endpoints/verify-captcha', async ctx => {
  try {
    const body = <Query>ctx.request.body
    print(body)
    const user = <TGUser>(JSON.parse(body.tglogin.user))

    // Verify signature
    const calculatedHash = await func.signature(body.request_query.msg_id, body.request_query.chat_id, user.id, body.request_query.timestamp)
    if (calculatedHash !== body.request_query.signature) {
      ctx.response.status = 400
      ctx.response.body = { message: "INVALID_REQUEST" }
      return
    }

    // Verify telegram login
    const loginResult = await func.verifyLogin(body.tglogin, process.env.TGWD_TOKEN || "")
    print(body.tglogin)
    if (!loginResult) {
      ctx.response.status = 401
      ctx.response.body = { message: "TELEGRAM_ACCOUNT_INFO_ERROR" }
      return
    }

    // Verify valid time
    if ((body.request_query.timestamp + 180000) < new Date().getTime()) {
      ctx.response.status = 400
      ctx.response.body = { message: "REQUEST_OVERTIMED" }
      await bot.api.deleteMessage(user.id, body.request_query.msg_id)
      await bot.api.declineChatJoinRequest(body.request_query.chat_id, user.id)
      return
    }

    // Verify captcha challenge
    const token = ctx.request.body.token
    const captchaResult = await func.verifyCaptcha(token)
    if (!captchaResult.success) {
      ctx.response.status = captchaResult.error?.code || 400
      ctx.response.body = { message: captchaResult.error?.alias || "CAPTCHA_NOT_PASSED" }
      await bot.api.deleteMessage(user.id, body.request_query.msg_id)
      await bot.api.declineChatJoinRequest(body.request_query.chat_id, user.id)
      return
    }
    
    // Accept user's join request
    await bot.api.approveChatJoinRequest(body.request_query.chat_id, user.id)

    // Delete verify message
    await bot.api.deleteMessage(user.id, body.request_query.msg_id)

    ctx.response.status = 204
  } catch (e) {
    console.log(e)
    // const err = JSON.parse(e.message)
    ctx.response.status = 500
    ctx.response.body = { message: "SERVER_UNAVAILABLE" }
  }
})
router.options('/endpoints/verify-captcha', async ctx => {
  ctx.response.status = 204
})
endpoint.use(router.routes())
endpoint.listen(process.env.TGWD_PORT)

