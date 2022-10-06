<script lang="ts">
import { RouterLink } from 'vue-router'
import { defineComponent } from 'vue'
import Turnstile from 'cfturnstile-vue3'
import axios from 'axios'

export default defineComponent({
  name: 'App',
  components: {
    RouterLink,
    Turnstile
  },
  data() {
    return {
      loginStatus: 0,
      errmsg: "",
      sitekey: import.meta.env.VITE_SITEKEY,
      tglogin: {},
      userProfile: {},
      query: this.$route.query,
      lang: navigator.language,
      initData: [] as string[]
    }
  },
  methods: {
    async captchaVerify(token: string) {
      await new Promise(resolve => {
        const interval = setInterval(() => {
          resolve('i am groot')
        }, 1000)
      })
      this.loginStatus = 3
      try {
        let tglogin = this.tglogin
        await axios.post(`${import.meta.env.VITE_ENDPOINT}/endpoints/verify-captcha`, { token, tglogin, request_query: this.query })
        this.loginStatus = 2
        window.Telegram.WebApp.HapticFeedback.notificationOccurred("success")
        window.Telegram.WebApp.MainButton.show().setParams({ text: this.$t("RESULTPAGE_BUTTON_DONE") }).onClick(() => { window.Telegram.WebApp.close() })
      } catch(e: any) {
        this.loginStatus = -2
        window.Telegram.WebApp.HapticFeedback.notificationOccurred("error")
        if (e.response) {
          this.errmsg = this.$t(`ERRCODE_${e.response.data.message}`) || this.$t("ERRCODE_UNKNOWN")
        } else {
          this.errmsg = this.$t("ERRCODE_UNKNOWN")
        }
      }
    },
    async debug() {
      console.log(this.lang)
    }
  },
  mounted() {
    if (window.Telegram.WebApp.initData) {
      const initDataRaw = decodeURIComponent(window.Telegram.WebApp.initData).split("&")
      this.initData = initDataRaw
      let initData: any = {}
      for (let i in initDataRaw) {
        // initData[initDataRaw[i].split("=")[0]] = initDataRaw[i].split("=")[1]
        switch (initDataRaw[i].split("=")[0]) {
          case 'query_id':
            initData.query_id = initDataRaw[i].split("=")[1]
            break
          case 'user':
            initData.user = initDataRaw[i].split("=")[1]
            break
          case 'auth_date':
            initData.auth_date = parseInt(initDataRaw[i].split("=")[1])
            break
          case 'hash':
            initData.hash = initDataRaw[i].split("=")[1]
            break
        }
      }
      this.tglogin = initData
      this.userProfile = JSON.parse(initData.user)
      this.loginStatus = 1
      /* if ((parseInt(this.query.timestamp) + 180000) < new Date().getTime()) {
        this.loginStatus = -3
      } */
    } else {
      this.loginStatus = -1
    }
  }
})
</script>

<template>
  <div class="home">
    <div v-if="loginStatus !== -1">
      <img src="~@/assets/robot.png" id="header_caption_image" />
      <!-- div class="greetings">{{ `${userProfile.first_name}${userProfile.last_name ? ` ${userProfile.last_name}` : ''}` }}，你好</div -->
      <div v-if="loginStatus === 0">
        <div class="descripction">{{ $t("LOGIN_REMINDER") }}</div>
      </div>
      <div v-else-if="loginStatus === 1">
        <div class="header_text">{{ $t('VERIFING_BANNER') }}</div>
        <div class="descripction_text">{{ $t('VERIFING_SUBTITLE') }}</div>
        <!--vue-hcaptcha :sitekey="sitekey" @verify="captchaVerify" /-->
        <div class="captcha_area">
          <turnstile :sitekey="sitekey" @verify="captchaVerify" />
        </div>
      </div>
      <div v-else-if="loginStatus === 2">
        <div class="header_text">{{ $t("PASSED_TITLE") }}</div>
        <div class="descripction_text" v-html="$t('PASSED_DESC')"></div>
      </div>
      <div v-else-if="loginStatus === 3">
        <div class="descripction_text">{{ $t("PLEASEWAIT") }}</div>
      </div>
      <div v-else-if="loginStatus === -2">
        <div class="header_text">{{ $t("ERROR_TITLE") }}</div>
        <div class="descripction_text" v-html="$t('ERROR_DESC', { errmsg })"></div>
      </div>
    </div>
    <div v-else>{{ $t("LANGUAGE_TEST") }}<br>{{ lang }}</div>
  </div>
</template>

<style scoped>
.home {
  text-align: center;
  font-family: sans-serif;
}
#header_caption_image {
  width: 100px;
  height: 100px;
  padding-top: 40px;
}
.header_text {
  color: var(--tg-theme-text-color);
  font-size: 26px;
  font-weight: bold;
  padding-top: 20px;
}
.descripction_text {
  color: var(--tg-theme-hint-color);
  padding-top: 10px;
}
.captcha_area {
  padding: 25px;
}
</style>
