# Floating-Iframe-Popup

一个高颜值、可拖拽按钮控制的 iframe 弹窗插件。支持消息通信、图片预览、全屏、刷新、在新窗口打开等丰富功能，适配多种引入方式，易于集成和二次开发。

## 功能亮点

- 🟦 可拖拽悬浮按钮，支持自定义内容和样式
- 🟦 弹窗支持全屏、刷新、在新窗口打开、标题自定义
- 🟦 弹窗和按钮均可拖动，体验流畅
- 🟦 内嵌 iframe，支持与父页面消息通信
- 🟦 iframe 内图片支持点击预览、缩放、拖拽
- 🟦 响应式设计，适配不同屏幕
- 🟦 纯原生 JavaScript，无第三方依赖
- 🟦 支持 ES Module、CommonJS、UMD 多种引入方式
- 🟦 完全可定制，支持丰富配置项

## 安装

```bash
npm install floating-iframe-popup
```

或直接下载 dist 目录下的 UMD 文件用于浏览器。

## 快速上手

### ES Module

```js
import FloatingIframePopup from 'floating-iframe-popup';

const popup = new FloatingIframePopup({
  iframeSrc: 'https://example.com',
  title: '演示弹窗',
  buttonOptions: {
    content: '打开'
  }
});
```

### CommonJS

```js
const FloatingIframePopup = require('floating-iframe-popup');

const popup = new FloatingIframePopup({
  iframeSrc: 'https://example.com',
  title: '演示弹窗'
});
```

### 浏览器直接引入

```html
<script src="dist/floating-iframe-popup.umd.min.js"></script>
<script>
  const popup = new FloatingIframePopup({
    iframeSrc: 'https://example.com',
    title: '演示弹窗',
    buttonOptions: {
      content: '打开'
    }
  });
</script>
```

## 配置项

| 参数             | 类型     | 默认值                                               | 说明                       |
|------------------|----------|------------------------------------------------------|----------------------------|
| iframeSrc        | String   | ''                                                   | iframe 加载的 URL          |
| title            | String   | '弹出窗口'                                           | 弹窗标题                   |
| buttonOptions    | Object   | `{ content: '入口', position: { bottom: 20, right: 20 } }` | 按钮内容、样式、位置等     |
| popupSize        | Object   | `{ width: '80%', height: '80%', maxWidth: '800px', maxHeight: '600px' }` | 弹窗尺寸                   |
| messageOptions   | Object   | `{ targetOrigin: '*', onMessage: null }`             | 消息通信配置               |

### buttonOptions 详解

- `content` 按钮显示内容（文本或 HTML）
- `activeContent` 激活状态内容
- `styles` 自定义按钮样式（对象）
- `position` 按钮初始位置，如 `{ bottom: 20, right: 20 }`

### popupSize 详解

- `width` 弹窗宽度（如 '80%' 或 '600px'）
- `height` 弹窗高度
- `maxWidth` 最大宽度
- `maxHeight` 最大高度

### messageOptions 详解

- `targetOrigin` postMessage 目标源
- `onMessage` 接收 iframe 消息的回调

## API

- `showPopup()` 显示弹窗
- `hidePopup()` 隐藏弹窗
- `togglePopup()` 切换弹窗显示/隐藏
- `updateIframeSrc(url)` 更新 iframe 地址
- `updateTitle(title)` 更新弹窗标题
- `updatePopupSize(size)` 更新弹窗尺寸
- `refreshIframe()` 刷新 iframe
- `openInNewWindow()` 在新窗口打开 iframe 页面
- `toggleFullscreen()` 切换全屏
- `destroy()` 销毁实例，移除所有元素和事件

## 高级特性

- **iframe 与父页面消息通信**  
  支持通过 `window.postMessage` 与 iframe 通信，详见 `messageOptions.onMessage`。

- **图片预览**  
  iframe 内图片可通过 postMessage 触发父页面图片预览，支持缩放、拖拽、重置。

- **自定义样式**  
  可通过 `buttonOptions.styles` 或覆盖 `.floating-iframe-popup` 相关 CSS 类自定义样式。

## 示例

详见 `example/` 目录，或运行：

```bash
npm install
npm run build
npx http-server
# 浏览器访问 http://localhost:8080/example/
```

## 许可证

MIT

---

如需更详细的开发、构建、发布说明，请参考 [INSTALL.md](./INSTALL.md)。

如需二次开发或定制，建议阅读源码注释，结构清晰易扩展。

---

如需进一步补充或有特殊定制需求，请告知！