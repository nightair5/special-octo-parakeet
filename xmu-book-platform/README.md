# 厦大二手书漂流平台（React 工程版）

高校学术蓝 + 凤凰花线稿风格的二手书平台，支持书籍市场、求购广场、真人口吻沟通、成交闭环与个人中心联动。

## 本地打开网页端

```bash
npm install
npm run dev
```

打开浏览器访问：
- `http://localhost:5173`
- 局域网访问可用：`npm run dev:host`

一键打开：
```bash
npm run dev:open
```

## 快捷键

网页内快捷导航：
- `Alt + 1`：首页书市
- `Alt + 2`：求购广场
- `Alt + 3`：个人中心
- `Alt + N`：打开发布抽屉

Windows 桌面全局热键（打开网页）：
```bash
npm run shortcut:create
```

执行后会在桌面创建快捷方式，并绑定 `Ctrl + Alt + X`。

## 当前功能

- 全站统一背景：纸纹底图 + 凤凰花蓝色勾线图案
- 左上角凤凰花 Logo + 平台名；左侧导航收窄，主内容区优先展示书籍
- 500 本结构化书库（教材/教辅/名著/考公考研/雅思托福/学科笔记/学习心得）
- 分类筛选、搜索、排序、收藏、分享
- 求购发布、求购响应、会话沟通、成交回流
- 个人中心五分区：收藏 / 我求购 / 我购买 / 建议反馈 / 搜索记录
- 运营看板：书籍规模、分类分布、活跃求购、转化与绿色贡献

## 核心脚本

```bash
npm run lint
npm run test:run
npm run build
npm run preview
```

## Cloudflare Pages 部署（唯一发布链路）

### 1) 首次配置

```bash
npx wrangler login
```

项目已包含：
- `wrangler.toml`（Pages 输出目录为 `dist`）
- `public/_redirects`（SPA 路由回退）
- `public/_headers`（基础缓存策略）

### 2) 部署

```bash
npm run deploy:cloudflare
```

等价命令：
```bash
npm run build
npx wrangler pages deploy dist --project-name xmu-book-platform
```

## Sentry 监控与 sourcemap

### 1) 复制环境变量

将 `.env.example` 复制为 `.env.local`，并填写：

```bash
VITE_SENTRY_DSN=
SENTRY_AUTH_TOKEN=
SENTRY_ORG=
SENTRY_PROJECT=
SENTRY_RELEASE=
```

### 2) 行为说明

- 运行时监控：`src/monitoring/sentry.ts` 读取 `VITE_SENTRY_DSN` 初始化前端 SDK
- 构建上传 sourcemap：`vite.config.ts` 在 `SENTRY_AUTH_TOKEN + ORG + PROJECT + RELEASE` 完整时自动启用 `@sentry/vite-plugin`
- 未配置 Sentry 变量时不会阻断构建

## 技术栈

- React 19 + TypeScript + Vite
- React Router
- localStorage 持久化
- Mock API（Promise + 延迟模拟）

## 目录整理（适合上传 GitHub）

- `src/`：前端源码
- `public/theme/`：线上页面使用的主题资源图
- `docs/reference-ui/`：UI 参考原图归档（不参与运行时加载）
- `scripts/`：本地工具脚本（如桌面快捷键生成）

## 上传到 GitHub（长期维护）

1. 在 GitHub 新建空仓库（例如 `xmu-book-platform`）
2. 在本地项目根目录执行：

```bash
git init
git add .
git commit -m "feat: xmu book platform ui upgrade"
git branch -M main
git remote add origin https://github.com/<你的用户名>/<你的仓库名>.git
git push -u origin main
```

3. 之后每次更新执行：

```bash
git add .
git commit -m "chore: update"
git push
```

## GitHub Pages（解决 404/无法打开）

项目已内置自动部署工作流：
- [.github/workflows/deploy-pages.yml](C:\Program Files (x86)\桌面\提案大赛\xmu-book-platform\.github\workflows\deploy-pages.yml)

首次启用请在 GitHub 仓库里设置：
1. 打开 `Settings -> Pages`
2. `Build and deployment` 选择 `Source: GitHub Actions`
3. 推送一次 `main` 分支，等待 `Actions` 里的 `Deploy To GitHub Pages` 成功

说明：
- 这个项目是 Vite + React 单页应用，不能直接把源码分支当成静态页面发布，必须先由 GitHub Actions 构建 `dist/`
- 已自动处理仓库子路径 `base`（例如 `/<repo-name>/`）
- 已自动生成 `404.html` 作为 React SPA 路由回退
- 因此不会再出现“站点不支持包含请求文件 / 根路径缺少 index.html”的典型错误
