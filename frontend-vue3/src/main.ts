declare global {
  interface Window {
    Telegram?: any;
  }
}

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createI18n } from 'vue-i18n'
import englishi18n from './locales/en/strings.json'
import simchinesei18n from './locales/zh-Hans/strings.json'
import tradchinesei18n from './locales/zh-Hant/strings.json'
import hkchinesei18n from './locales/zh-HK/strings.json'
import japi18n from './locales/ja/strings.json'
import twchinesei18n from './locales/zh-TW/strings.json'
import rui18n from './locales/ru/strings.json'

const app = createApp(App)

app.use(router)

const i18n = createI18n({
  locale: 'en',
  messages: {
    en: englishi18n,
    'zh-Hans': simchinesei18n,
    'zh-Hant': tradchinesei18n,
    'zh-HK': hkchinesei18n,
    ja: japi18n,
    'zh-TW': twchinesei18n,
    ru: rui18n
  }
})

app.use(i18n)

app.mount('#app')
