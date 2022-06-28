<template>
  <div class="home">
    <div v-if="loginStatus !== -1">
      <img src="~@/assets/robot.png" id="header_caption_image" />
      <!-- div class="greetings">{{ `${userProfile.first_name}${userProfile.last_name ? ` ${userProfile.last_name}` : ''}` }}，你好</div -->
      <div v-if="loginStatus === 0">
        <div class="descripction">正在验证登录……</div>
      </div>
      <div v-else-if="loginStatus === 1">
        <div class="header_text">是真人吗？</div>
        <div class="descripction_text">请完成以下人机验证，以加入群组。</div>
        <!--vue-hcaptcha :sitekey="sitekey" @verify="captchaVerify" /-->
        <div class="captcha_area">
          <vue-friendly-captcha :sitekey="sitekey" @done="captchaVerify" />
        </div>
      </div>
      <div v-else-if="loginStatus === 2">
        <div class="header_text">验证已通过</div>
        <div class="descripction_text">您可以在聊天列表找到您刚才加入的群组。<br>如果无法找到群聊，建议尝试重启应用。</div>
      </div>
      <div v-else-if="loginStatus === 3">
        <div class="descripction_text">请稍等……</div>
      </div>
      <div v-else-if="loginStatus === -2">
        <div class="header_text">出现错误</div>
        <div class="descripction_text">服务器返回了一个错误：{{errmsg}}<br>请重新申请加群并完成验证。</div>
      </div>
      <div v-else-if="loginStatus === -3">
        <div class="header_text">过期啦！</div>
        <div class="descripction_text">这个验证请求已超过其有效期。<br>请重新申请加群并完成验证。</div>
      </div>
    </div>
    <div v-else>{{back_domain}}</div>
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
      query: this.$route.query
    }
  },
  methods: {
    async captchaVerify(token) {
      this.loginStatus = 3
      try {
        const {chat_id} = this.$route.query
        let tglogin = this.tglogin
        await axios.post(`/endpoints/verify-captcha`, { token, tglogin, chat_id })
        this.loginStatus = 2
        window.Telegram.WebApp.MainButton.show().setParams({ text: "结束" }).onClick(() => { window.Telegram.WebApp.close() })
      } catch(e) {
        this.loginStatus = -2
        if (e.response) {
          this.errmsg = e.response.data.message || "未知错误"
        } else {
          this.errmsg = "未知错误"
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
      if ((parseInt(this.query.timestamp) + 180000) < new Date().getTime()) {
        this.loginStatus = -3
      }
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