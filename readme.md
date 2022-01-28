# Telegram 看门狗
适用于 Telegram 私有群（private groups）的验证机器人。

该 bot 使用 Telegram 私有群中的「邀请链接」相关 API（由于公开群组无「邀请链接」和「入群预审（join requests）」功能，因此无法用于公开群组），可以在有人申请加群时私聊申请人，并要求对方完成 hCaptcha 验证。

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