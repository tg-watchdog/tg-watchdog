import Dotenv from "dotenv"
import { Bot, Context } from "grammy"
import { Fluent } from "@moebius/fluent"
import { FluentContextFlavor, useFluent } from "@grammyjs/fluent"
import Debug from "debug"

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
const bot = new Bot<BotContext>(process.env.TGWD_TOKEN || "")

bot.use(useFluent({ fluent, defaultLocale: "en"}))

bot.command("start", async ctx => {
  await ctx.reply(ctx.t("welcome"), {
    disable_web_page_preview: true,
    reply_markup: {
      inline_keyboard: [[
        {
          text: ctx.t("setmeasadmin"),
          url: `https://t.me/${ctx.me.username}?startgroup=start&admin=can_invite_users`
        }
      ]]
    }
  })
})

bot.catch(async err => {
  print("Error detected while running the bot!")
  print(err)
})

bot.start()