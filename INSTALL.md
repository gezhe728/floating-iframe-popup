# 安装和运行指南

## 开发环境设置

1. 克隆本仓库：

```bash
git clone <repository-url>
cd floating-iframe-popup
```

2. 安装依赖：

```bash
npm install
```

3. 开发模式运行：

```bash
npm run dev
```

这将启动开发模式，并在文件更改时自动重新构建。

4. 构建生产版本：

```bash
npm run build
```

这将在`dist`目录中生成以下文件：
- `floating-iframe-popup.js` (CommonJS版本)
- `floating-iframe-popup.esm.js` (ES Module版本)
- `floating-iframe-popup.umd.js` (UMD版本)
- `floating-iframe-popup.umd.min.js` (UMD压缩版本)

## 运行示例

构建完成后，您可以通过任何静态文件服务器运行示例：

```bash
# 使用Node.js的http-server工具（如果已安装）
npx http-server

# 或者使用Python的内置HTTP服务器
python -m http.server
```

然后在浏览器中访问`http://localhost:8080/example/`查看示例页面。

## 文件结构说明

- `src/` - 源代码目录
  - `index.js` - 主入口文件
  - `styles/` - 样式文件目录
    - `main.less` - 主样式文件
- `dist/` - 构建输出目录
- `example/` - 示例项目
  - `index.html` - 示例主页
  - `iframe-content.html` - iframe内容示例页面
- `rollup.config.js` - Rollup构建配置
- `package.json` - 项目配置和依赖 