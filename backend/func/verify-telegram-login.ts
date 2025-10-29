import crypto from 'crypto'

/**
 * Telegram Login Widget 数据结构
 */
export type TelegramLoginData = {
  id: number
  first_name: string
  last_name?: string
  username?: string
  photo_url?: string
  auth_date: number
  hash: string
}

/**
 * 验证 Telegram Login Widget 返回的数据
 *
 * 使用与 Telegram WebApp initData 相同的验证算法：
 * 1. 使用 Bot Token 的 SHA256 作为密钥
 * 2. 构建数据检查字符串（除 hash 外的所有字段，按字母排序）
 * 3. 计算 HMAC-SHA256
 * 4. 对比 hash
 *
 * @param data Telegram Login Widget 返回的数据对象
 * @param botToken Telegram Bot Token
 * @returns 验证是否通过
 */
export async function verifyTelegramLogin(
  data: TelegramLoginData,
  botToken: string
): Promise<boolean> {
  try {
    // 1. 提取 hash
    const { hash, ...checkData } = data

    // 2. 生成密钥（使用 Bot Token 的 SHA256）
    const secretKey = crypto.createHash('sha256').update(botToken).digest()

    // 3. 构建数据检查字符串（按字母排序）
    const dataCheckString = Object.keys(checkData)
      .sort()
      .map(key => `${key}=${(checkData as any)[key]}`)
      .join('\n')

    // 4. 计算 HMAC-SHA256
    const calculatedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex')

    // 5. 对比 hash
    if (calculatedHash !== hash) {
      console.error('Telegram Login hash 验证失败')
      return false
    }

    // 6. 验证时间戳（防止过期登录，24 小时有效期）
    const now = Math.floor(Date.now() / 1000)
    if (now - data.auth_date > 86400) {
      console.error(`Telegram Login 已过期: auth_date=${data.auth_date}, now=${now}`)
      return false
    }

    return true
  } catch (e) {
    console.error('验证 Telegram Login 失败:', e)
    return false
  }
}
