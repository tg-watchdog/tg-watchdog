# TG-Watchdog 测试指南

本文档描述了 TG-Watchdog 项目的测试策略和如何运行测试。

## 🏗️ 测试架构

```
┌─────────────────────────────────────────────────────────┐
│                    E2E 测试 (Playwright)                 │
│         (完整用户流程: 加入群组 → 验证 → 通过)              │
├─────────────────────────────────────────────────────────┤
│                  集成测试 (API/Bot)                       │
│    (HTTP API 端点测试 + Telegram Bot 模拟交互)            │
├─────────────────────────────────────────────────────────┤
│                    单元测试 (Jest/Vitest)                 │
│  (签名算法 / 验证码验证 / Telegram Login 验证 / 工具函数)   │
└─────────────────────────────────────────────────────────┘
```

## 📁 测试文件结构

```
backend/
├── __tests__/
│   ├── unit/              # 单元测试
│   │   ├── signature.test.ts
│   │   ├── verify-telegram-login.test.ts
│   │   └── verify-captcha.test.ts
│   ├── integration/       # 集成测试
│   │   └── api.test.ts
│   └── setup.ts           # 测试环境配置
├── jest.config.js         # Jest 配置
└── package.json

frontend-vue3/
├── src/
│   └── utils/
│       └── __tests__/     # 工具函数单元测试
├── e2e/                   # E2E 测试
│   └── verify-page.spec.ts
├── vitest.config.ts       # Vitest 配置
└── playwright.config.ts   # Playwright 配置
```

## 🚀 快速开始

### 安装依赖

```bash
# Backend
cd backend
npm install

# Frontend
cd frontend-vue3
npm install
```

### 运行所有测试

```bash
# Backend 测试
cd backend
npm test

# Frontend 单元测试
cd frontend-vue3
npm run test:unit

# Frontend E2E 测试
cd frontend-vue3
npm run test:e2e
```

## 🧪 Backend 测试

### 技术栈
- **Jest**: 测试框架
- **ts-jest**: TypeScript 支持
- **Supertest**: HTTP 断言

### 运行测试

```bash
cd backend

# 运行所有测试
npm test

# 监视模式
npm run test:watch

# 生成覆盖率报告
npm run test:coverage

# 仅运行集成测试
npm run test:integration

# 类型检查
npm run lint
```

### 测试覆盖范围

| 模块 | 测试内容 |
|------|----------|
| `signature.ts` | SHA-256 签名生成一致性、唯一性、边界条件 |
| `verify-telegram-login.ts` | Telegram Login Widget 验证、hash 校验、过期检测 |
| `verify-captcha.ts` | Cloudflare Turnstile API 调用、响应处理 |
| `API endpoints` | HTTP 状态码、请求验证、错误处理 |

### 环境变量

测试使用以下环境变量（已配置在 `__tests__/setup.ts`）:

```env
NODE_ENV=test
TGWD_TOKEN=test_bot_token
TGWD_SECRET=test_signature_secret
TGWD_PORT=3001
TGWD_FRONTEND_DOMAIN=localhost:4173
TGWD_CFTS_API_KEY=test_turnstile_key
TGWD_DOMAIN=localhost
```

## 🎨 Frontend 测试

### 技术栈
- **Vitest**: 单元测试框架
- **@vue/test-utils**: Vue 组件测试
- **Playwright**: E2E 测试

### 单元测试

```bash
cd frontend-vue3

# 运行单元测试
npm run test:unit

# 监视模式
npm run test:unit -- --watch

# 生成覆盖率报告
npm run test:unit:coverage
```

### E2E 测试 (Playwright)

```bash
cd frontend-vue3

# 安装浏览器（首次运行）
npx playwright install

# 运行所有 E2E 测试
npm run test:e2e

# 交互式 UI 模式
npm run test:e2e:ui

# 调试模式
npm run test:e2e:debug

# 特定浏览器
npx playwright test --project=chromium
```

### E2E 测试覆盖场景

1. **页面加载**
   - 有效参数加载
   - 缺少参数错误处理
   - 过期请求处理

2. **UI 检查**
   - 验证消息显示
   - 响应式布局
   - Telegram 登录按钮

3. **API 集成**
   - 验证 API 调用
   - 错误响应处理
   - 网络异常处理

4. **性能**
   - 页面加载时间 < 3 秒

## 🐳 Docker 测试

### 本地构建测试

```bash
# 构建后端镜像
docker build -t tg-watchdog-backend:test ./backend

# 构建前端镜像
docker build -t tg-watchdog-frontend:test ./frontend-vue3

# 测试运行
docker-compose up --build
```

## 🔄 CI/CD 集成

### GitHub Actions 工作流

测试会在以下情况自动运行:
- Push 到 `main`, `dev`, `roadmap/**` 分支
- 任何 PR 到 `main` 或 `dev` 分支

### 测试矩阵

| 任务 | Node 版本 | 说明 |
|------|----------|------|
| Backend Tests | 18, 20, 22 | 单元测试 + 集成测试 |
| Frontend Unit | 22 | Vitest 单元测试 |
| Frontend E2E | 22 | Playwright E2E 测试 |
| Docker Build | - | 镜像构建测试 |

### 查看测试结果

1. 进入 PR 页面
2. 点击 "Checks" 标签
3. 查看详细测试报告

## 📝 编写新测试

### Backend 单元测试示例

```typescript
import { signature } from '../../func/signature';

describe('signature', () => {
  it('should generate consistent hash', async () => {
    const result1 = await signature(1, -100123, 123, 1700000000);
    const result2 = await signature(1, -100123, 123, 1700000000);
    expect(result1).toBe(result2);
  });
});
```

### Frontend 单元测试示例

```typescript
import { describe, it, expect } from 'vitest';
import { parseVerificationUrl } from './url-parser';

describe('parseVerificationUrl', () => {
  it('should parse all required parameters', () => {
    const result = parseVerificationUrl('?chat_id=-100123&msg_id=456');
    expect(result.chat_id).toBe('-100123');
    expect(result.msg_id).toBe('456');
  });
});
```

### E2E 测试示例

```typescript
import { test, expect } from '@playwright/test';

test('should load verification page', async ({ page }) => {
  await page.goto('/?chat_id=-100123&msg_id=456&timestamp=123&signature=abc');
  await expect(page.locator('body')).toBeVisible();
});
```

## 🐛 调试技巧

### Backend

```bash
# 单文件测试
npx jest signature.test.ts

# 带调试信息
npx jest --verbose

# 调试模式
node --inspect-brk node_modules/.bin/jest --runInBand
```

### Frontend

```bash
# Vitest 调试
npx vitest --inspect-brk

# Playwright 调试
npx playwright test --debug

# 查看浏览器
npx playwright test --headed
```

## 📊 覆盖率报告

测试覆盖率报告会自动生成:

- **Backend**: `backend/coverage/`
- **Frontend**: `frontend-vue3/coverage/`

查看报告:
```bash
# Backend
cd backend && npm run test:coverage
open coverage/lcov-report/index.html

# Frontend
cd frontend-vue3 && npm run test:unit:coverage
open coverage/index.html
```

## 🔗 相关链接

- [Jest 文档](https://jestjs.io/)
- [Vitest 文档](https://vitest.dev/)
- [Playwright 文档](https://playwright.dev/)
- [Supertest 文档](https://github.com/visionmedia/supertest)

## 💡 最佳实践

1. **测试命名**: 清晰描述测试场景，如 `should reject expired request`
2. **独立性**: 每个测试应独立运行，不依赖其他测试
3. **Mock 外部依赖**: 使用 mock 处理 Telegram API、数据库等外部服务
4. **边界条件**: 测试正常情况、错误情况和边界条件
5. **保持更新**: 代码变更时同步更新测试

---

如有问题，请提交 Issue 或联系维护团队。
