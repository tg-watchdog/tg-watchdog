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
          <vue-friendly-captcha :sitekey="sitekey" :language="lang" @done="captchaVerify" />
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

<script>
// @ is an alias to /src
import axios from 'axios'
import VueFriendlyCaptcha from '@somushq/vue-friendly-captcha'
export default {
  name: 'Home',
  components: {
    VueFriendlyCaptcha
  },
  data() {
    return {
      loginStatus: 0,
      errmsg: "",
      sitekey: process.env.VUE_APP_SITEKEY,
      tglogin: {},
      userProfile: {},
      query: this.$route.query,
      lang: navigator.language
    }
  },
  methods: {
    async captchaVerify(token) {
      this.loginStatus = 3
      try {
        let tglogin = this.tglogin
        await axios.post(`/endpoints/verify-captcha`, { token, tglogin, request_query: this.query })
        this.loginStatus = 2
        window.Telegram.WebApp.MainButton.show().setParams({ text: "结束" }).onClick(() => { window.Telegram.WebApp.close() })
      } catch(e) {
        this.loginStatus = -2
        if (e.response) {
          this.errmsg = this.$t(`ERRCODE_${e.response.data.message}`) || this.$t("ERRCODE_UNKNOWN")
        } else {
          this.errmsg = this.$t("ERRCODE_UNKNOWN")
        }
      }
    }
  },
  mounted() {
    if (window.Telegram.WebApp.initData) {
      const initDataRaw = decodeURIComponent(window.Telegram.WebApp.initData).split("&")
      let initData = {}
      for (let i in initDataRaw) {
        initData[initDataRaw[i].split("=")[0]] = initDataRaw[i].split("=")[1]
      }
      this.$data.tglogin = initData
      this.$data.userProfile = JSON.parse(initData.user)
      this.loginStatus = 1
      /* if ((parseInt(this.query.timestamp) + 180000) < new Date().getTime()) {
        this.loginStatus = -3
      } */
    } else {
      this.loginStatus = -1
    }
  }
}
</script>

<style>
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