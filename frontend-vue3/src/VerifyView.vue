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
			isFallbackMode: false,
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
			// return
			await new Promise(resolve => {
				const interval = setInterval(() => {
					resolve('i am groot')
				}, 1000)
			})
			this.loginStatus = 3
			try {
				let tglogin = this.tglogin
				const endpoint = this.isFallbackMode
					? '/endpoints/verify-captcha-fallback'
					: '/endpoints/verify-captcha'

				await axios.post(`${import.meta.env.VITE_ENDPOINT}${endpoint}`, {
					token,
					tglogin,
					request_query: this.query
				})

				this.loginStatus = 2

				if (!this.isFallbackMode && window.Telegram?.WebApp) {
					window.Telegram.WebApp.HapticFeedback.notificationOccurred("success")
					window.Telegram.WebApp.MainButton.show().setParams({ text: this.$t("RESULTPAGE_BUTTON_DONE") }).onClick(() => { window.Telegram.WebApp.close() })
				}
			} catch (e: any) {
				this.loginStatus = -2
				if (!this.isFallbackMode && window.Telegram?.WebApp) {
					window.Telegram.WebApp.HapticFeedback.notificationOccurred("error")
				}
				if (e.response) {
					this.errmsg = this.$t(`ERRCODE_${e.response.data.message}`) || this.$t("ERRCODE_UNKNOWN")
				} else {
					this.errmsg = this.$t("ERRCODE_UNKNOWN")
				}
			}
		},
		loadTelegramLoginWidget() {
			// 定义全局回调函数
			(window as any).onTelegramAuth = this.handleTelegramAuth

			// 创建 script 标签加载 Telegram Login Widget
			const script = document.createElement('script')
			script.async = true
			script.src = 'https://telegram.org/js/telegram-widget.js?22'
			script.setAttribute('data-telegram-login', import.meta.env.VITE_BOT_USERNAME || 'TG_Watchdog_bot')
			script.setAttribute('data-size', 'large')
			script.setAttribute('data-userpic', 'true')
			script.setAttribute('data-request-access', 'write')
			script.setAttribute('data-onauth', 'onTelegramAuth(user)')

			const container = document.getElementById('telegram-login-container')
			if (container) {
				container.appendChild(script)
			}
		},
		handleTelegramAuth(user: any) {
			console.log('Telegram Login 成功:', user)

			// 验证 user_id 是否与 URL 中的一致
			const urlUserId = parseInt(this.query.user_id as string)
			if (user.id !== urlUserId) {
				this.loginStatus = -1
				this.errmsg = this.$t("FALLBACK_USER_MISMATCH") || "User ID mismatch"
				alert(this.errmsg)
				return
			}

			// 保存登录数据
			this.tglogin = user
			this.userProfile = user
			this.loginStatus = 1  // 进入验证阶段
		},
		injectFallbackTheme() {
			// 在浏览器回退模式下注入 Telegram 主题 CSS 变量
			const root = document.documentElement

			// 检测系统深色模式
			const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches

			// 定义浅色主题
			const lightTheme = {
				'--tg-color-scheme': 'light',
				'--tg-theme-bg-color': '#ffffff',
				'--tg-theme-accent-text-color': '#2481cc',
				'--tg-theme-header-bg-color': '#efeff3',
				'--tg-theme-subtitle-text-color': '#999999',
				'--tg-theme-link-color': '#2481cc',
				'--tg-theme-section-header-text-color': '#6d6d71',
				'--tg-theme-text-color': '#000000',
				'--tg-theme-button-color': '#2481cc',
				'--tg-theme-section-bg-color': '#ffffff',
				'--tg-theme-hint-color': '#999999',
				'--tg-theme-section-separator-color': '#eaeaea',
				'--tg-theme-bottom-bar-bg-color': '#e4e4e4',
				'--tg-theme-destructive-text-color': '#ff3b30',
				'--tg-theme-button-text-color': '#ffffff',
				'--tg-theme-secondary-bg-color': '#efeff3'
			}

			// 定义深色主题（使用 Telegram 官方深色模式颜色）
			const darkTheme = {
				'--tg-color-scheme': 'dark',
				'--tg-theme-bg-color': '#18222d',
				'--tg-theme-text-color': '#ffffff',
				'--tg-theme-section-separator-color': '#213040',
				'--tg-theme-link-color': '#62bcf9',
				'--tg-theme-subtitle-text-color': '#b1c3d5',
				'--tg-theme-bottom-bar-bg-color': '#213040',
				'--tg-theme-section-header-text-color': '#b1c3d5',
				'--tg-theme-hint-color': '#b1c3d5',
				'--tg-theme-secondary-bg-color': '#131415',
				'--tg-theme-button-text-color': '#ffffff',
				'--tg-theme-header-bg-color': '#131415',
				'--tg-theme-section-bg-color': '#18222d',
				'--tg-theme-accent-text-color': '#2ea6ff',
				'--tg-theme-button-color': '#2ea6ff',
				'--tg-theme-destructive-text-color': '#ef5b5b'
			}

			// 视口相关变量（两种主题通用）
			const viewportVars = {
				'--tg-viewport-height': '100vh',
				'--tg-viewport-stable-height': '100vh',
				'--tg-safe-area-inset-top': '0px',
				'--tg-safe-area-inset-bottom': '0px',
				'--tg-safe-area-inset-left': '0px',
				'--tg-safe-area-inset-right': '0px'
			}

			// 选择主题
			const themeVars = prefersDark ? { ...darkTheme, ...viewportVars } : { ...lightTheme, ...viewportVars }

			// 设置所有 CSS 变量
			Object.entries(themeVars).forEach(([key, value]) => {
				root.style.setProperty(key, value)
			})

			// 设置 body 背景色
			document.body.style.backgroundColor = themeVars['--tg-theme-bg-color']

			console.log(`已注入 Telegram 主题 CSS 变量（浏览器回退模式 - ${prefersDark ? '深色' : '浅色'}主题）`)
		},
		async debug() {
			console.log(this.lang)
		}
	},
	mounted() {
		// 检查是否为浏览器回退模式
		this.isFallbackMode = this.query.fallback === '1'

		if (window.Telegram?.WebApp?.initData && !this.isFallbackMode) {
			// WebApp 模式（原有逻辑）
			console.log("WebApp 模式")
			const params = new URLSearchParams(window.Telegram.WebApp.initData)
			console.log(Array.from(params.entries()))
			this.initData = Array.from(params.entries()).map(entry => entry.join('='))
			let initData: any = {}
			for (const [key, value] of params.entries()) {
				initData[key] = value
			}
			this.tglogin = initData
			this.userProfile = JSON.parse(initData.user)
			this.loginStatus = 1
			/* if ((parseInt(this.query.timestamp) + 180000) < new Date().getTime()) {
				this.loginStatus = -3
			} */
		} else if (this.isFallbackMode) {
			// 浏览器回退模式
			console.log("浏览器回退模式")
			this.loginStatus = 0  // 等待登录

			// 注入 Telegram 主题 CSS 变量
			this.injectFallbackTheme()

			// 延迟加载 Login Widget 以确保 DOM 已渲染
			this.$nextTick(() => {
				this.loadTelegramLoginWidget()
			})
		} else {
			// WebApp 不可用且不是回退模式
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

			<!-- 浏览器回退模式 - 登录阶段 -->
			<div v-if="loginStatus === 0 && isFallbackMode" class="fallback-login">
				<div class="header_text">{{ $t("FALLBACK_LOGIN_TITLE") }}</div>
				<div class="descripction_text">{{ $t("FALLBACK_LOGIN_NOTICE") }}</div>
				<div id="telegram-login-container" style="margin-top: 20px;"></div>
			</div>

			<!-- WebApp 模式 - 等待登录 -->
			<div v-else-if="loginStatus === 0">
				<div class="descripction">{{ $t("LOGIN_REMINDER") }}</div>
			</div>

			<!-- 已登录 - 显示 CAPTCHA -->
			<div v-else-if="loginStatus === 1">
				<div v-if="isFallbackMode" class="fallback-verified">
					<div class="header_text">{{ $t("FALLBACK_LOGGED_IN", { name: userProfile.first_name || 'User' }) }}</div>
				</div>
				<div v-else class="header_text">{{ $t('VERIFING_BANNER') }}</div>
				<div class="descripction_text">{{ $t('VERIFING_SUBTITLE') }}</div>
				<!--vue-hcaptcha :sitekey="sitekey" @verify="captchaVerify" /-->
				<div class="captcha_area">
					<turnstile :sitekey="sitekey" @verify="captchaVerify" />
				</div>
			</div>

			<!-- 验证成功 -->
			<div v-else-if="loginStatus === 2">
				<div class="header_text">{{ $t("PASSED_TITLE") }}</div>
				<div class="descripction_text" v-if="isFallbackMode">
					{{ $t("FALLBACK_SUCCESS") }}
				</div>
				<div class="descripction_text" v-else v-html="$t('PASSED_DESC')"></div>
			</div>

			<!-- 正在验证 -->
			<div v-else-if="loginStatus === 3">
				<div class="descripction_text">{{ $t("PLEASEWAIT") }}</div>
			</div>

			<!-- 验证失败 -->
			<div v-else-if="loginStatus === -2">
				<div class="header_text">{{ $t("ERROR_TITLE") }}</div>
				<div class="descripction_text" v-html="$t('ERROR_DESC', { errmsg })"></div>
			</div>
		</div>
		<div v-else>{{ $t("LANGUAGE_TEST") }}<br>{{ lang }}</div>
		<div class="footer" v-html="$t('FOOTER')" />
	</div>
</template>

<style scoped>
.home {
	text-align: center;
	font-family: sans-serif;
	height: 100vh;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
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

.footer {
	margin-bottom: 16px;
	font-size: 12px;
	margin-left: 16px;
	margin-right: 16px;
	color: var(--tg-theme-hint-color);
}
</style>
