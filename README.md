# 物流运输管理系统

基于 React + TypeScript + Vite 构建的物流运输管理后台系统。

## 技术栈

- **框架**: React 18 + TypeScript
- **构建工具**: Vite
- **样式**: TailwindCSS
- **状态管理**: Zustand
- **路由**: React Router
- **图表**: Recharts
- **图标**: Lucide React
- **测试**: Vitest + Testing Library

## 环境要求

- Node.js >= 18.0.0
- npm >= 9.0.0 或 pnpm >= 8.0.0

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 本地开发

```bash
npm run dev
```

启动后访问: http://localhost:5173

### 3. 环境变量配置

本项目目前使用 Mock 数据，无需配置环境变量即可运行。

如需配置环境变量，请创建 `.env` 文件（参考 `.env.example`）：

```bash
# 复制示例文件
cp .env.example .env
```

## 可用脚本

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动本地开发服务器 |
| `npm run build` | 构建生产版本 |
| `npm run preview` | 预览生产构建 |
| `npm run lint` | 运行 ESLint 代码检查 |
| `npm run check` | 运行 TypeScript 类型检查 |
| `npm run test` | 启动 Vitest 测试（监听模式） |
| `npm run test:run` | 运行所有测试并退出 |

## 基础检查清单

拉取代码后，请按以下步骤验证项目是否正常运行：

### ✅ 1. 依赖安装检查
```bash
npm install
```
确保没有安装错误。

### ✅ 2. TypeScript 类型检查
```bash
npm run check
```
确保没有类型错误。

### ✅ 3. 代码规范检查
```bash
npm run lint
```
确保没有 ESLint 错误。

### ✅ 4. 单元测试
```bash
npm run test:run
```
确保所有测试通过。

### ✅ 5. 生产构建
```bash
npm run build
```
确保构建成功，生成 `dist` 目录。

### ✅ 6. 本地启动验证
```bash
npm run dev
```
访问 http://localhost:5173，确认页面正常加载。

## 项目结构

```
src/
├── assets/          # 静态资源
├── components/      # 公共组件
│   └── transport/   # 运输模块组件
├── constants/       # 常量定义
├── data/            # Mock 数据
├── hooks/           # 自定义 Hooks
├── lib/             # 工具库
├── pages/           # 页面组件
├── store/           # Zustand 状态管理
├── test/            # 测试配置
├── types/           # TypeScript 类型定义
├── App.tsx          # 应用入口组件
├── main.tsx         # 应用入口
└── index.css        # 全局样式
```

## 功能模块

- **需求管理** - `/demands`
- **报价管理** - `/quotes`
- **供应商管理** - `/suppliers`
- **审批管理** - `/approvals`
- **运输看板** - `/transport`
- **成本分析** - `/cost-analysis`
- **预警规则** - `/warning-rules`
- **Mock 数据** - `/mock`
