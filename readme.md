# Telegram 看门狗
适用于 Telegram 私有群（private groups）的验证机器人。

该 bot 使用 Telegram 入群审核相关 API 功能，可以在有人申请加群时私聊申请人，并要求对方完成 Friendly Captcha 验证。

[前往官方博客](https://telegram.org/blog/shared-media-scrolling-calendar-join-requests-and-more#join-requests-for-groups-and-channels) 了解该功能。

## 技术细节
![](https://s3.bmp.ovh/imgs/2022/01/17606cf1b48c19bb.png)

## 为什么（不）

### 为什么用 Telegram Login，而不是单纯传输验证信息？
利用 Telegram Login，可以通过 Telegram 服务器来验证传来的用户信息真实性。

如果不用 Telegram Login 的话，也有其他解决方案：

- 直接将用户信息插入至 URL 中，有信息伪造攻击的潜在可能性
- 服务器保存请求，生成随机 token 进行标记，这需要服务器拥有数据库，对隐私和系统稳定性有要求

请放心，看门狗不会存储任何与用户数据有关的信息，所有信息仅用于验证，并会在当次验证后直接销毁。

### 为什么不做 In-chat 验证，像其他 Bot 一样？
技术力不够 + 有被随机攻击的可能性。但是后期考虑为自部署用户提供「Q&A」验证模式。

### 为什么用 Friendly Captcha 而不是其他 CAPTCHA 服务？
只是有些人不喜欢 reCaptcha。后期考虑增加 Friendly Captcha 甚至更多 CAPTCHA 服务。用户只需通过一个服务验证即视为完成 CAPTCHA 验证。

### 为什么不能自己部署？
其实应该是可以的，只是比较麻烦。文档之后会出。

## 使用方法

### 使用预先部署的机器人
- [在 Telegram 启动 bot](https://t.me/WatchdogVerifyBot)
- 将 bot 设为私有群管理员，并为其开启「Invite users via link（通过链接邀请用户）」权限
- 为 bot 生成一个邀请链接，勾选「Request admin approval（要求管理员同意）」
- 将新生成的链接公开发布，其他用户通过点击链接并申请入群，就能触发 bot 进行私聊

### 使用自行部署的机器人
*TBD*

## TODO
- [ ] Docker 部署
- [ ] 多语言