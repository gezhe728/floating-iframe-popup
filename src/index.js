import FloatingButton from './floating-button';
import IframeImagePreview from './iframe-image-preview';
import { BUTTON_ICONS } from './constant';
import './styles/main.less';

class FloatingIframePopup {
  /**
   * 构造函数
   * @param {Object} options - 配置选项
   * @param {string} [options.iframeSrc=''] - iframe加载的URL
   * @param {string} [options.title=''] - 弹出层标题
   * @param {Object} [options.buttonOptions] - 悬浮按钮配置
   * @param {Object} [options.popupSize] - 弹出层尺寸
   * @param {string} [options.popupSize.width='80%'] - 弹出层宽度
   * @param {string} [options.popupSize.height='80%'] - 弹出层高度
   * @param {string} [options.popupSize.maxWidth='800px'] - 弹出层最大宽度
   * @param {string} [options.popupSize.maxHeight='600px'] - 弹出层最大高度
   * @param {Object} [options.messageOptions] - 消息通信选项
   * @param {string} [options.messageOptions.targetOrigin='*'] - postMessage的目标源
   * @param {Function} [options.messageOptions.onMessage] - 接收iframe消息的回调函数
   */
  constructor(options = {}) {
    // 默认配置
    this.options = {
      iframeSrc: options.iframeSrc || '',
      title: options.title || '弹出窗口',
      buttonOptions: options.buttonOptions,
      popupSize: {
        width: options.popupSize?.width || '80%',
        height: options.popupSize?.height || '80%',
        maxWidth: options.popupSize?.maxWidth || '800px',
        maxHeight: options.popupSize?.maxHeight || '600px'
      },
      messageOptions: {
        targetOrigin: options.messageOptions?.targetOrigin || options.iframeSrc?.replace(/\?.*$/, '') || '*',
        onMessage: options.messageOptions?.onMessage || null
      }
    };

    // iframe是否已初始化
    this.isIframeInitialized = false;
    
    // 标记iframe是否已显示过，用于决定是否需要刷新
    this.hasIframeBeenShown = false;
    
    // 创建DOM元素
    this.init();
    
    // 绑定事件
    this.bindEvents();
  }

  /**
   * 初始化DOM元素
   */
  init() {
    // 创建主容器
    this.container = document.createElement('div');
    this.container.className = 'floating-iframe-popup';
    
    this.button = new FloatingButton({
      ...this.options?.buttonOptions ?? {},
      parentEl: this.container,
      onClick: this.togglePopup.bind(this)
    });
    
    // 创建弹出层
    this.popup = document.createElement('div');
    this.popup.className = 'floating-iframe-popup-popup';
    this.popup.style.width = this.options.popupSize.width;
    this.popup.style.height = this.options.popupSize.height;
    this.popup.style.maxWidth = this.options.popupSize.maxWidth;
    this.popup.style.maxHeight = this.options.popupSize.maxHeight;
    
    // 创建弹窗头部
    this.popupHeader = document.createElement('div');
    this.popupHeader.className = 'floating-iframe-popup-popup-header';
    this.popupHeader.style.cursor = 'move'; // 添加拖动鼠标样式
    
    // 创建标题
    this.popupTitle = document.createElement('div');
    this.popupTitle.className = 'floating-iframe-popup-popup-title';
    this.popupTitle.textContent = this.options.title;
    
    // 创建头部按钮容器
    this.headerButtons = document.createElement('div');
    this.headerButtons.className = 'floating-iframe-popup-popup-buttons';
    
    // 创建刷新按钮
    this.refreshButton = document.createElement('button');
    this.refreshButton.className = 'floating-iframe-popup-popup-button';
    this.refreshButton.innerHTML = BUTTON_ICONS.refresh;
    this.refreshButton.setAttribute('title', '刷新');
    this.refreshButton.setAttribute('type', 'button');
    
    // 创建在新窗口打开按钮
    this.openInNewWindowButton = document.createElement('button');
    this.openInNewWindowButton.className = 'floating-iframe-popup-popup-button';
    this.openInNewWindowButton.innerHTML = BUTTON_ICONS.openInNewWindow;
    this.openInNewWindowButton.setAttribute('title', '在新窗口打开');
    this.openInNewWindowButton.setAttribute('type', 'button');
    
    // 创建全屏按钮
    this.fullscreenButton = document.createElement('button');
    this.fullscreenButton.className = 'floating-iframe-popup-popup-button';
    this.fullscreenButton.innerHTML = BUTTON_ICONS.fullscreen;
    this.fullscreenButton.setAttribute('title', '全屏');
    this.fullscreenButton.setAttribute('type', 'button');
    
    // 创建关闭按钮
    this.closeButton = document.createElement('button');
    this.closeButton.className = 'floating-iframe-popup-popup-button';
    this.closeButton.innerHTML = BUTTON_ICONS.close;
    this.closeButton.setAttribute('title', '关闭');
    this.closeButton.setAttribute('type', 'button');
    
    // 创建iframe容器 (实际iframe稍后懒加载)
    this.iframeContainer = document.createElement('div');
    this.iframeContainer.className = 'floating-iframe-popup-iframe-container';
    
    // 组装DOM结构
    this.headerButtons.appendChild(this.refreshButton);
    this.headerButtons.appendChild(this.openInNewWindowButton);
    this.headerButtons.appendChild(this.fullscreenButton);
    this.headerButtons.appendChild(this.closeButton);
    this.popupHeader.appendChild(this.popupTitle);
    this.popupHeader.appendChild(this.headerButtons);
    this.popup.appendChild(this.popupHeader);
    this.popup.appendChild(this.iframeContainer);
    this.container.appendChild(this.popup);
    
    // 添加到页面
    document.body.appendChild(this.container);
    
    // 初始化图片预览器
    this.imagePreview = new IframeImagePreview();
    
    // 标记是否处于全屏状态
    this.isFullscreen = false;
  }

  /**
   * 初始化iframe
   * @private
   */
  initializeIframe() {
    if (this.isIframeInitialized) return;
    
    // 创建iframe
    this.iframe = document.createElement('iframe');
    this.iframe.className = 'floating-iframe-popup-iframe';
    this.iframe.src = this.options.iframeSrc;
    
    // 添加到容器
    this.iframeContainer.appendChild(this.iframe);
    
    // 设置消息监听
    this._onIframeMessage = this.onIframeMessage.bind(this);
    window.addEventListener('message', this._onIframeMessage);
    
    this.isIframeInitialized = true;
  }

  /**
   * iframe消息处理
   * @param {MessageEvent} event - 消息事件
   * @private
   */
  onIframeMessage(event) {
    // 安全检查：确保消息来源是当前加载的iframe
    if (this.iframe && this.iframe.contentWindow === event.source) {
      // 处理图片预览消息
      if (event.data && event.data.type === 'preview_image' && event.data.data) {
        this.imagePreview.show(event.data.data);
      }
      
      // 调用用户定义的回调函数
      if (this.options.messageOptions.onMessage) {
        this.options.messageOptions.onMessage(event.data, event);
      }
    }
  }

  /**
   * 向iframe发送消息
   * @param {any} message - 要发送的消息
   * @param {string} [targetOrigin] - 目标源，默认使用配置的targetOrigin
   */
  sendMessageToIframe(message, targetOrigin) {
    if (!this.isIframeInitialized || !this.iframe.contentWindow) {
      console.warn('iframe尚未初始化，无法发送消息');
      return;
    }
    
    const origin = targetOrigin || this.options.messageOptions.targetOrigin;
    this.iframe.contentWindow.postMessage(message, origin);
  }

  /**
   * 绑定事件
   */
  bindEvents() {
    // 关闭按钮点击事件
    this.closeButton.addEventListener('click', () => {
      this.hidePopup();
    });
    
    // 刷新按钮点击事件
    this.refreshButton.addEventListener('click', () => {
      this.refreshIframe();
    });
    
    // 在新窗口打开按钮点击事件
    this.openInNewWindowButton.addEventListener('click', () => {
      this.openInNewWindow();
    });
    
    // 全屏按钮点击事件
    this.fullscreenButton.addEventListener('click', () => {
      this.toggleFullscreen();
    });
    
    // 弹窗拖动事件 - 仅标题栏可拖动
    this.setupDragForElement(this.popupHeader, {
      onMove: (deltaX, deltaY, initialPos) => {
        // 如果处于全屏状态，不允许拖动
        if (this.isFullscreen) return;
        
        // 仅防止完全拖出屏幕，允许左侧和其他方向一样可以部分超出
        const minLeft = -1 * (this.popup.offsetWidth - 100);
        const maxLeft = window.innerWidth - 100;
        const minTop = 0; // 顶部仍然不允许超出
        const maxTop = window.innerHeight - 100;
        
        const newLeft = Math.min(Math.max(minLeft, initialPos.left + deltaX), maxLeft);
        const newTop = Math.min(Math.max(minTop, initialPos.top + deltaY), maxTop);
        
        this.popup.style.left = newLeft + 'px';
        this.popup.style.top = newTop + 'px';
      },
      condition: () => this.isOpen && !this.isFullscreen
    });
  }
  
  /**
   * 为元素设置拖动功能
   * @param {HTMLElement} element - 要设置拖动的元素
   * @param {Object} options - 配置选项
   * @param {Function} options.onMove - 移动时的回调
   * @param {Function} [options.onDragStart] - 开始拖动时的回调
   * @param {Function} [options.condition] - 判断是否可拖动的条件
   */
  setupDragForElement(element, options) {
    // 移除现有处理器（如果存在）
    if (element._dragHandlers) {
      element.removeEventListener('mousedown', element._dragHandlers.onMouseDown, true);
      document.removeEventListener('mousemove', element._dragHandlers.onMouseMove, true);
      document.removeEventListener('mouseup', element._dragHandlers.onMouseUp, true);
    }
    
    // 记录拖动状态的变量
    let dragging = false;
    let startX, startY;
    let initialPos = {};
    let hasMoved = false; // 标记是否有移动
    const dragThreshold = 5; // 拖动阈值，避免微小移动触发拖动
    
    const onStartDrag = () => {
      // 如果提供了开始拖动的回调，执行它
      if (options.onDragStart) {
        options.onDragStart();
      }
      
      // 拖动开始时临时提高当前拖动元素的z-index
      if (element === this.popupHeader) {
        // 拖动弹窗时
        const originalZIndex = this.popup.style.zIndex || 999;
        this.popup.dataset.originalZIndex = originalZIndex;
        this.popup.style.zIndex = 1002; // 临时提高z-index
      }
      
      // 之前版本可能会有残留的覆盖层，先移除
      if (this.dragOverlay && this.dragOverlay.parentNode) {
        document.body.removeChild(this.dragOverlay);
        this.dragOverlay = null;
      }
      
      // 添加一个透明覆盖层来捕获所有鼠标事件，防止事件目标切换
      this.dragOverlay = document.createElement('div');
      this.dragOverlay.className = 'floating-iframe-popup-drag-overlay';
      this.dragOverlay.style.position = 'fixed';
      this.dragOverlay.style.top = '0';
      this.dragOverlay.style.left = '0';
      this.dragOverlay.style.width = '100%';
      this.dragOverlay.style.height = '100%';
      this.dragOverlay.style.zIndex = 1001;
      this.dragOverlay.style.cursor = 'move';
      this.dragOverlay.style.background = 'transparent';
      this.dragOverlay.style.pointerEvents = 'auto'; // 确保捕获事件
      
      document.body.appendChild(this.dragOverlay);
      
      // 绑定覆盖层事件
      this._overlayMouseMove = (e) => {
        // 转发事件到onMouseMove
        onMouseMove(e);
      };
      
      this._overlayMouseUp = (e) => {
        // 先处理mouseup事件
        onMouseUp(e);
        
        // 移除事件监听
        this.dragOverlay.removeEventListener('mousemove', this._overlayMouseMove);
        this.dragOverlay.removeEventListener('mouseup', this._overlayMouseUp);
      };
      
      // 将鼠标事件的处理委托给overlay
      this.dragOverlay.addEventListener('mousemove', this._overlayMouseMove);
      this.dragOverlay.addEventListener('mouseup', this._overlayMouseUp);
    };
    
    const onEndDrag = () => {
      // 恢复原始z-index
      if (element === this.popupHeader && this.popup.dataset.originalZIndex) {
        this.popup.style.zIndex = this.popup.dataset.originalZIndex;
      }
      
      // 移除覆盖层及其事件
      if (this.dragOverlay) {
        if (this._overlayMouseMove) {
          this.dragOverlay.removeEventListener('mousemove', this._overlayMouseMove);
          this._overlayMouseMove = null;
        }
        
        if (this._overlayMouseUp) {
          this.dragOverlay.removeEventListener('mouseup', this._overlayMouseUp);
          this._overlayMouseUp = null;
        }
        
        document.body.removeChild(this.dragOverlay);
        this.dragOverlay = null;
      }
    };
    
    const onMouseDown = (e) => {
      // 仅处理鼠标左键
      if (e.button !== 0) return;
      
      // 如果有条件判断且不满足条件，则不允许拖动
      if (options.condition && !options.condition()) return;
      
      // 如果是关闭按钮，不处理拖动
      if (e.target === this.closeButton) return;
      
      // 记录初始位置
      startX = e.clientX;
      startY = e.clientY;
      
      // 记录元素的初始位置
      const rect = this.popup.getBoundingClientRect();
      initialPos = { 
        left: rect.left,
        top: rect.top,
        right: rect.right,
        bottom: rect.bottom
      };
      
      // 设置拖动状态
      dragging = true;
      hasMoved = false; // 重置移动标记
      
      // 阻止事件冒泡和默认行为
      e.stopPropagation();
      e.preventDefault();
    };
    
    const onMouseMove = (e) => {
      if (!dragging) return;
      
      // 计算移动距离
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;
      
      // 检查是否超过拖动阈值
      const distanceMoved = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      
      if (!hasMoved && distanceMoved > dragThreshold) {
        hasMoved = true;
        
        // 添加拖动样式
        if (element === this.popupHeader) {
          this.popup.classList.add('floating-iframe-popup-popup--dragging');
        }
        
        // 当首次真正拖动时才添加覆盖层
        onStartDrag();
      }
      
      // 只有真正移动了才更新位置
      if (hasMoved) {
        // 调用回调更新位置
        options.onMove(deltaX, deltaY, initialPos);
      }
      
      // 阻止事件冒泡和默认行为
      e.stopPropagation();
      e.preventDefault();
    };
    
    const onMouseUp = (e) => {
      if (!dragging) return;
      
      const wasDragging = hasMoved; // 记录是否真正发生了拖动
      
      // 重置拖动状态
      dragging = false;
      
      // 移除拖动样式
      if (element === this.popupHeader) {
        this.popup.classList.remove('floating-iframe-popup-popup--dragging');
      }
      
      // 如果发生过实际拖动，则移除覆盖层
      if (wasDragging) {
        onEndDrag();
      }
      
      // 阻止事件冒泡
      e.stopPropagation();
      e.preventDefault();
    };
    
    // 添加事件监听，使用捕获阶段防止事件冒泡导致的干扰
    element.addEventListener('mousedown', onMouseDown, true);
    document.addEventListener('mousemove', onMouseMove, true);
    document.addEventListener('mouseup', onMouseUp, true);
    
    // 记录事件处理函数，以便后续清理
    element._dragHandlers = { onMouseDown, onMouseMove, onMouseUp };
  }

  /**
   * 切换弹出层显示状态
   */
  togglePopup() {
    if (this.isOpen) {
      this.hidePopup();
    } else {
      this.showPopup();
    }
  }

  /**
   * 显示弹出层
   */
  showPopup() {
    // 第一次显示时初始化iframe
    if (!this.isIframeInitialized) {
      this.initializeIframe();
      this.hasIframeBeenShown = true; // 设置标志表示iframe已显示过
    } else if (this.hasIframeBeenShown) {
      // 如果iframe已初始化且不是第一次显示，则刷新iframe内容
      this.refreshIframe();
    } else {
      // 如果这是第一次显示且iframe未初始化，则设置标志表示已显示但未刷新
      this.hasIframeBeenShown = true;
    }
    
    this.isOpen = true;
    this.popup.classList.add('floating-iframe-popup-popup--active');
    this.button.switchButtonStatus(true);
    
    // 居中显示弹窗
    const popupWidth = this.popup.offsetWidth || parseInt(this.options.popupSize.maxWidth);
    const popupHeight = this.popup.offsetHeight || parseInt(this.options.popupSize.maxHeight);
    
    const left = (window.innerWidth - popupWidth) / 2;
    const top = (window.innerHeight - popupHeight) / 2;
    
    this.popup.style.left = `${left}px`;
    this.popup.style.top = `${top}px`;
  }

  /**
   * 隐藏弹出层
   */
  hidePopup() {
    this.isOpen = false;
    this.popup.classList.remove('floating-iframe-popup-popup--active');
    this.button.switchButtonStatus(false);
  }

  /**
   * 更新iframe地址
   * @param {string} url - 新的iframe URL
   */
  updateIframeSrc(url) {
    this.options.iframeSrc = url;
    
    if (this.isIframeInitialized && this.iframe) {
      this.iframe.src = url;
    }
  }

  /**
   * 更新弹窗标题
   * @param {string} title - 新的标题
   */
  updateTitle(title) {
    this.options.title = title;
    this.popupTitle.textContent = title;
  }

  /**
   * 更新弹出层尺寸
   * @param {Object} size - 尺寸配置
   */
  updatePopupSize(size = {}) {
    if (size.width) {
      this.options.popupSize.width = size.width;
      this.popup.style.width = size.width;
    }
    if (size.height) {
      this.options.popupSize.height = size.height;
      this.popup.style.height = size.height;
    }
    if (size.maxWidth) {
      this.options.popupSize.maxWidth = size.maxWidth;
      this.popup.style.maxWidth = size.maxWidth;
    }
    if (size.maxHeight) {
      this.options.popupSize.maxHeight = size.maxHeight;
      this.popup.style.maxHeight = size.maxHeight;
    }
  }

  /**
   * 刷新iframe
   */
  refreshIframe() {
    if (this.isIframeInitialized && this.iframe) {
      // 保存当前URL
      const currentSrc = this.iframe.src;
      
      // 重新加载iframe
      this.iframe.src = currentSrc;
    }
  }

  /**
   * 在新窗口打开iframe页面
   */
  openInNewWindow() {
    if (this.isIframeInitialized && this.iframe) {
      window.open(this.iframe.src, '_blank');
    } else if (this.options.iframeSrc) {
      window.open(this.options.iframeSrc, '_blank');
    }
  }

  /**
   * 切换全屏状态
   */
  toggleFullscreen() {
    if (this.isFullscreen) {
      this.exitFullscreen();
    } else {
      this.enterFullscreen();
    }
  }

  /**
   * 进入全屏模式
   */
  enterFullscreen() {
    if (this.isFullscreen) return;
    
    // 保存当前尺寸和位置，以便退出全屏时恢复
    this._savedPopupStyle = {
      width: this.popup.style.width,
      height: this.popup.style.height,
      maxWidth: this.popup.style.maxWidth,
      maxHeight: this.popup.style.maxHeight,
      left: this.popup.style.left,
      top: this.popup.style.top
    };
    
    // 设置全屏样式
    this.fullscreenButton.innerHTML = BUTTON_ICONS.exitFullscreen;
    this.fullscreenButton.setAttribute('title', '退出全屏');
    
    // 设置全屏位置和尺寸
    this.popup.style.width = '100%';
    this.popup.style.height = '100%';
    this.popup.style.maxWidth = '100%';
    this.popup.style.maxHeight = '100%';
    this.popup.style.left = '0';
    this.popup.style.top = '0';
    
    this.isFullscreen = true;
  }

  /**
   * 退出全屏模式
   */
  exitFullscreen() {
    if (!this.isFullscreen) return;
    
    // 移除全屏样式
    this.fullscreenButton.innerHTML = BUTTON_ICONS.fullscreen;
    this.fullscreenButton.setAttribute('title', '全屏');
    
    // 恢复之前的尺寸和位置
    if (this._savedPopupStyle) {
      this.popup.style.width = this._savedPopupStyle.width;
      this.popup.style.height = this._savedPopupStyle.height;
      this.popup.style.maxWidth = this._savedPopupStyle.maxWidth;
      this.popup.style.maxHeight = this._savedPopupStyle.maxHeight;
      this.popup.style.left = this._savedPopupStyle.left;
      this.popup.style.top = this._savedPopupStyle.top;
    }
    
    this.isFullscreen = false;
  }

  /**
   * 销毁插件，移除所有元素和事件监听
   */
  destroy() {
    // 移除消息监听
    if (this._onIframeMessage) {
      window.removeEventListener('message', this._onIframeMessage);
      this._onIframeMessage = null;
    }
    
    // 清理可能残留的拖动覆盖层
    if (this.dragOverlay && this.dragOverlay.parentNode) {
      document.body.removeChild(this.dragOverlay);
      this.dragOverlay = null;
    }
    
    this.button.destroy();
    
    // 移除弹窗头部拖动事件监听
    if (this.popupHeader._dragHandlers) {
      this.popupHeader.removeEventListener('mousedown', this.popupHeader._dragHandlers.onMouseDown, true);
      document.removeEventListener('mousemove', this.popupHeader._dragHandlers.onMouseMove, true);
      document.removeEventListener('mouseup', this.popupHeader._dragHandlers.onMouseUp, true);
      this.popupHeader._dragHandlers = null;
    }
    
    // 清理 overlay 事件监听
    if (this._overlayMouseMove) {
      if (this.dragOverlay) {
        this.dragOverlay.removeEventListener('mousemove', this._overlayMouseMove);
      }
      this._overlayMouseMove = null;
    }
    
    if (this._overlayMouseUp) {
      if (this.dragOverlay) {
        this.dragOverlay.removeEventListener('mouseup', this._overlayMouseUp);
      }
      this._overlayMouseUp = null;
    }
    
    // 移除所有头部按钮事件
    if (this.headerButtons) {
      // 移除关闭按钮事件
      if (this.closeButton) {
        this.closeButton.replaceWith(this.closeButton.cloneNode(true));
      }
      
      // 移除刷新按钮事件
      if (this.refreshButton) {
        this.refreshButton.replaceWith(this.refreshButton.cloneNode(true));
      }
      
      // 移除在新窗口打开按钮事件
      if (this.openInNewWindowButton) {
        this.openInNewWindowButton.replaceWith(this.openInNewWindowButton.cloneNode(true));
      }
      
      // 移除全屏按钮事件
      if (this.fullscreenButton) {
        this.fullscreenButton.replaceWith(this.fullscreenButton.cloneNode(true));
      }
    }
    
    // 从DOM中移除
    if (this.container && this.container.parentNode) {
      document.body.removeChild(this.container);
    }
    
    // 销毁图片预览器
    if (this.imagePreview) {
      this.imagePreview.destroy();
      this.imagePreview = null;
    }
    
    // 清理所有引用
    this.popup = null;
    this.popupHeader = null;
    this.popupTitle = null;
    this.closeButton = null;
    this.refreshButton = null;
    this.openInNewWindowButton = null;
    this.fullscreenButton = null;
    this.headerButtons = null;
    this.iframeContainer = null;
    this.iframe = null;
    this.container = null;
  }
}

export default FloatingIframePopup;