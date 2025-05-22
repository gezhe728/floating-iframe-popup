/**
 * 可拖拽按钮
 * @author chenw
 */
class FloatingButton {
  /**
   * 构造函数
   * @param {Object} options - 配置选项
   * @param {string|HTMLElement} [options.content='入口'] - 按钮显示的内容，可以是文本或HTML元素
   * @param {string|HTMLElement} [options.activeContent] - 按钮激活状态显示的内容，不设置则使用buttonContent
   * @param {Object} [options.styles] - 按钮样式
   * @param {Object} [options.position] - 按钮初始位置
   * @param {number} [options.position.bottom=20] - 距底部位置
   * @param {number} [options.position.right=20] - 距右侧位置
   * @param {Function} [options.onClick] - 按钮点击事件函数
   * @param {HTMLElement} [options.parentEl] - 父节点
   */
  constructor(options = {}) {
    // 默认配置
    this.options = {
      content: options.content || '入口',
      activeContent: options.activeContent || options.content || '入口',
      styles: options.styles,
      position: {
        bottom: options.position?.bottom || 20,
        right: options.position?.right || 20
      },
      onClick: options.onClick,
      container: options.parentEl
    };
    
    // 创建DOM元素
    this.init();
    
    // 绑定事件
    this.bindEvents();
  }

  /**
   * 初始化DOM元素
   */
  init() {
    // 创建按钮
    this.button = document.createElement('button');
    this.button.className = 'floating-iframe-popup-button';
    this.setButtonContent(this.options.content);

    const styles = this.options.styles;
    if (styles) {
        for (let key in styles) {
            this.button.style[key] = styles[key];
        }
    }

    this.button.style.bottom = `${this.options.position.bottom}px`;
    this.button.style.right = `${this.options.position.right}px`;
    this.button.style.pointerEvents = 'auto';
    this.button.setAttribute('type', 'button'); // 确保按钮不会在表单中提交
    
    this.options.container.appendChild(this.button);
    
    // 设置特性标记来区分点击和拖动
    this.button.setAttribute('data-is-draggable', 'true');
  }

  /**
   * 设置按钮内容
   * @param {string|HTMLElement} content - 按钮内容
   * @private
   */
  setButtonContent(content) {
    // 清空当前内容
    while (this.button.firstChild) {
      this.button.removeChild(this.button.firstChild);
    }
    
    if (typeof content === 'string') {
      // 如果是HTML字符串
      if (content.trim().startsWith('<') && content.trim().endsWith('>')) {
        this.button.innerHTML = content;
      } else {
        // 普通文本
        this.button.textContent = content;
      }
    } else if (content instanceof HTMLElement) {
      // 如果是DOM元素
      this.button.appendChild(content);
    }
  }

  /**
   * 绑定事件
   */
  bindEvents() {
    // 移除之前所有的按钮相关事件处理器
    if (this.button._mouseDownHandler) {
      this.button.removeEventListener('mousedown', this.button._mouseDownHandler);
    }
    if (this.button._clickHandler) {
      this.button.removeEventListener('click', this.button._clickHandler);
    }
    
    // 标记是否是拖动操作
    this.button._isDragging = false;
    this.button._hasMovedThreshold = false;
    
    // 监听mousedown事件用于处理拖动和点击
    this.button._mouseDownHandler = (e) => {
      if (e.button !== 0) return; // 只处理左键
      
      // 记录初始位置
      const startX = e.clientX;
      const startY = e.clientY;
      const initialRight = this.options.position.right;
      const initialBottom = this.options.position.bottom;
      const buttonWidth = this.button.offsetWidth;
      const buttonHeight = this.button.offsetHeight;
      
      // 重置拖动状态
      this.button._isDragging = false;
      this.button._hasMovedThreshold = false;
      
      const moveHandler = (moveEvent) => {
        // 计算移动距离
        const deltaX = moveEvent.clientX - startX;
        const deltaY = moveEvent.clientY - startY;
        
        // 设置拖动阈值
        const threshold = 5;
        const totalMovement = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        
        // 判断是否超过阈值，开始拖动
        if (!this.button._hasMovedThreshold && totalMovement > threshold) {
          this.button._hasMovedThreshold = true;
          this.button._isDragging = true;
          
          // 添加拖动时的视觉样式
          this.button.classList.add('floating-iframe-popup-button--dragging');
          
          // 创建覆盖层提高性能
          const overlay = document.createElement('div');
          overlay.className = 'floating-iframe-popup-drag-overlay';
          overlay.style.position = 'fixed';
          overlay.style.top = '0';
          overlay.style.left = '0';
          overlay.style.width = '100%';
          overlay.style.height = '100%';
          overlay.style.zIndex = '1001';
          overlay.style.cursor = 'move';
          document.body.appendChild(overlay);
          
          // 存储覆盖层引用以便释放
          this._buttonDragOverlay = overlay;
        }
        
        // 只有确认在拖动时才更新位置
        if (this.button._hasMovedThreshold) {
          // 获取浏览器窗口的尺寸
          const windowWidth = window.innerWidth;
          const windowHeight = window.innerHeight;
          
          // 按钮位于右下角，计算新的right和bottom值
          let newRight = Math.max(0, initialRight - deltaX);
          let newBottom = Math.max(0, initialBottom - deltaY);
          
          // 确保按钮不会超出窗口左侧和顶部
          // 由于按钮定位是从右下角计算的，需要确保按钮至少有20px在可视区域内
          newRight = Math.min(newRight, windowWidth - buttonWidth);
          newBottom = Math.min(newBottom, windowHeight - buttonHeight);
          
          // 更新按钮位置
          this.button.style.right = newRight + 'px';
          this.button.style.bottom = newBottom + 'px';
          
          // 更新存储的位置
          this.options.position.right = newRight;
          this.options.position.bottom = newBottom;
          
          // 防止触发点击
          moveEvent.preventDefault();
          moveEvent.stopPropagation();
        }
      };
      
      const upHandler = (upEvent) => {
        // 移除所有事件监听器
        document.removeEventListener('mousemove', moveHandler, true);
        document.removeEventListener('mouseup', upHandler, true);
        
        // 如果是拖动，则清理拖动相关状态
        if (this.button._hasMovedThreshold) {
          // 移除拖动样式
          this.button.classList.remove('floating-iframe-popup-button--dragging');
          
          // 移除覆盖层
          if (this._buttonDragOverlay) {
            document.body.removeChild(this._buttonDragOverlay);
            this._buttonDragOverlay = null;
          }
        } else {
            // 如果没有超过拖动阈值，则触发点击操作
            // 如果正在拖动中，不触发切换
            if (!this.button._isDragging) this.options.onClick();
        }
        
        // 重置按钮的拖动状态
        setTimeout(() => {
          this.button._isDragging = false;
          this.button._hasMovedThreshold = false;
        }, 0);
      };
      
      // 添加鼠标移动和抬起事件监听
      document.addEventListener('mousemove', moveHandler, true);
      document.addEventListener('mouseup', upHandler, true);
      
      // 阻止事件冒泡和默认行为
      e.stopPropagation();
      e.preventDefault();
    };
    
    // 添加mousedown事件监听
    this.button.addEventListener('mousedown', this.button._mouseDownHandler, true);
  }

  /**
   * 切换按钮状态
   * @param {boolean} active - 是否激活按钮
   */
  switchButtonStatus(active) {
    if (active) {
        this.button.classList.add('floating-iframe-popup-button--active');
    
        // 切换按钮状态显示内容
        this.setButtonContent(this.options.activeContent);
    } else {
        this.button.classList.remove('floating-iframe-popup-button--active');
    
        // 恢复按钮内容
        this.setButtonContent(this.options.content);
    }
  }

  /**
   * 更新按钮内容
   * @param {string|HTMLElement} content - 新的按钮内容
   * @param {string|HTMLElement} [activeContent] - 新的激活状态按钮内容
   */
  updateButtonContent(content, activeContent) {
    this.options.content = content;
    
    if (activeContent !== undefined) {
      this.options.activeContent = activeContent;
    }
    
    // 根据当前状态设置内容
    if (this.isOpen) {
      this.setButtonContent(this.options.activeContent);
    } else {
      this.setButtonContent(this.options.content);
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
   * 销毁插件，移除所有元素和事件监听
   */
  destroy() {
    // 清理按钮拖动覆盖层
    if (this._buttonDragOverlay && this._buttonDragOverlay.parentNode) {
      document.body.removeChild(this._buttonDragOverlay);
      this._buttonDragOverlay = null;
    }
    
    // 移除按钮相关的事件监听
    if (this.button._mouseDownHandler) {
      this.button.removeEventListener('mousedown', this.button._mouseDownHandler, true);
      this.button._mouseDownHandler = null;
    }
    
    // 清理所有引用
    this.button = null;
  }
}

export default FloatingButton;