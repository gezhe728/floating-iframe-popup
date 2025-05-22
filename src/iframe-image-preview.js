import { BUTTON_ICONS } from './constant';

/**
 * iframe图片预览功能
 * 支持点击按钮和鼠标滚轮放大缩小
 */
class IframeImagePreview {
  /**
   * 构造函数
   */
  constructor() {
    // 创建DOM元素
    this.init();
    
    // 当前缩放比例
    this.scale = 1;
    
    // 最小和最大缩放比例
    this.minScale = 0.1;
    this.maxScale = 5;
    
    // 缩放步长
    this.scaleStep = 0.1;
    
    // 是否正在拖动
    this.isDragging = false;
    
    // 拖动起始位置
    this.dragStartX = 0;
    this.dragStartY = 0;
    
    // 图片位置
    this.imageX = 0;
    this.imageY = 0;
    
    // 绑定事件
    this.bindEvents();
  }

  /**
   * 初始化DOM元素
   */
  init() {
    // 创建预览容器
    this.container = document.createElement('div');
    this.container.className = 'iframe-image-preview';
    this.container.style.display = 'none';
    this.container.style.position = 'fixed';
    this.container.style.top = '0';
    this.container.style.left = '0';
    this.container.style.width = '100%';
    this.container.style.height = '100%';
    this.container.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    this.container.style.zIndex = '1100';
    this.container.style.display = 'none';
    this.container.style.justifyContent = 'center';
    this.container.style.alignItems = 'center';
    this.container.style.overflow = 'hidden';
    
    // 创建图片容器
    this.imageContainer = document.createElement('div');
    this.imageContainer.className = 'iframe-image-preview-image-container';
    this.imageContainer.style.position = 'relative';
    this.imageContainer.style.display = 'flex';
    this.imageContainer.style.justifyContent = 'center';
    this.imageContainer.style.alignItems = 'center';
    this.imageContainer.style.width = '100%';
    this.imageContainer.style.height = '100%';
    
    // 创建图片元素
    this.image = document.createElement('img');
    this.image.className = 'iframe-image-preview-image';
    this.image.style.maxWidth = '90%';
    this.image.style.maxHeight = '90%';
    this.image.style.objectFit = 'contain';
    this.image.style.transition = 'transform 0.1s ease';
    this.image.style.transformOrigin = 'center center';
    
    // 创建工具栏
    this.toolbar = document.createElement('div');
    this.toolbar.className = 'iframe-image-preview-toolbar';
    this.toolbar.style.position = 'absolute';
    this.toolbar.style.bottom = '20px';
    this.toolbar.style.left = '50%';
    this.toolbar.style.transform = 'translateX(-50%)';
    this.toolbar.style.display = 'flex';
    this.toolbar.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    this.toolbar.style.borderRadius = '20px';
    this.toolbar.style.padding = '5px 15px';
    
    // 创建放大按钮
    this.zoomInButton = document.createElement('button');
    this.zoomInButton.className = 'iframe-image-preview-zoom-in';
    this.zoomInButton.innerHTML = '+';
    this.zoomInButton.style.backgroundColor = 'transparent';
    this.zoomInButton.style.border = 'none';
    this.zoomInButton.style.color = 'white';
    this.zoomInButton.style.fontSize = '20px';
    this.zoomInButton.style.padding = '5px 10px';
    this.zoomInButton.style.cursor = 'pointer';
    this.zoomInButton.style.outline = 'none';
    
    // 创建缩小按钮
    this.zoomOutButton = document.createElement('button');
    this.zoomOutButton.className = 'iframe-image-preview-zoom-out';
    this.zoomOutButton.innerHTML = '-';
    this.zoomOutButton.style.backgroundColor = 'transparent';
    this.zoomOutButton.style.border = 'none';
    this.zoomOutButton.style.color = 'white';
    this.zoomOutButton.style.fontSize = '20px';
    this.zoomOutButton.style.padding = '5px 10px';
    this.zoomOutButton.style.cursor = 'pointer';
    this.zoomOutButton.style.outline = 'none';
    
    // 创建缩放比例显示
    this.zoomLevel = document.createElement('span');
    this.zoomLevel.className = 'iframe-image-preview-zoom-level';
    this.zoomLevel.style.color = 'white';
    this.zoomLevel.style.padding = '7px 10px 0';
    this.zoomLevel.style.fontSize = '14px';
    this.updateZoomLevel();
    
    // 创建重置按钮
    this.resetButton = document.createElement('button');
    this.resetButton.className = 'iframe-image-preview-reset';
    this.resetButton.innerHTML = '重置';
    this.resetButton.style.backgroundColor = 'transparent';
    this.resetButton.style.border = 'none';
    this.resetButton.style.color = 'white';
    this.resetButton.style.fontSize = '14px';
    this.resetButton.style.padding = '5px 10px';
    this.resetButton.style.cursor = 'pointer';
    this.resetButton.style.outline = 'none';
    
    // 创建关闭按钮
    this.closeButton = document.createElement('button');
    this.closeButton.className = 'iframe-image-preview-close';
    this.closeButton.innerHTML = BUTTON_ICONS.close;
    this.closeButton.style.position = 'absolute';
    this.closeButton.style.top = '20px';
    this.closeButton.style.right = '20px';
    this.closeButton.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    this.closeButton.style.border = 'none';
    this.closeButton.style.borderRadius = '50%';
    this.closeButton.style.color = 'white';
    this.closeButton.style.fontSize = '24px';
    this.closeButton.style.width = '40px';
    this.closeButton.style.height = '40px';
    this.closeButton.style.cursor = 'pointer';
    this.closeButton.style.outline = 'none';
    this.closeButton.style.display = 'flex';
    this.closeButton.style.justifyContent = 'center';
    this.closeButton.style.alignItems = 'center';
    
    // 组装DOM结构
    this.toolbar.appendChild(this.zoomOutButton);
    this.toolbar.appendChild(this.zoomLevel);
    this.toolbar.appendChild(this.zoomInButton);
    this.toolbar.appendChild(this.resetButton);
    
    this.imageContainer.appendChild(this.image);
    
    this.container.appendChild(this.imageContainer);
    this.container.appendChild(this.toolbar);
    this.container.appendChild(this.closeButton);
    
    // 添加到页面
    document.body.appendChild(this.container);
  }

  /**
   * 绑定事件
   */
  bindEvents() {
    // 放大按钮点击事件
    this.zoomInButton.addEventListener('click', () => {
      this.zoomIn();
    });
    
    // 缩小按钮点击事件
    this.zoomOutButton.addEventListener('click', () => {
      this.zoomOut();
    });
    
    // 重置按钮点击事件
    this.resetButton.addEventListener('click', () => {
      this.resetZoom();
    });
    
    // 关闭按钮点击事件
    this.closeButton.addEventListener('click', () => {
      this.hide();
    });
    
    // 点击背景关闭预览
    this.container.addEventListener('click', (e) => {
      if (e.target === this.container) {
        this.hide();
      }
    });
    
    // 鼠标滚轮缩放
    this.container.addEventListener('wheel', (e) => {
      e.preventDefault();
      if (e.deltaY < 0) {
        this.zoomIn();
      } else {
        this.zoomOut();
      }
    });
    
    // 图片拖动
    this.image.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return; // 只处理左键
      
      this.isDragging = true;
      this.dragStartX = e.clientX;
      this.dragStartY = e.clientY;
      
      // 阻止默认行为和冒泡
      e.preventDefault();
      e.stopPropagation();
    });
    
    document.addEventListener('mousemove', (e) => {
      if (!this.isDragging) return;
      
      const deltaX = e.clientX - this.dragStartX;
      const deltaY = e.clientY - this.dragStartY;
      
      this.imageX += deltaX;
      this.imageY += deltaY;
      
      this.updateImagePosition();
      
      this.dragStartX = e.clientX;
      this.dragStartY = e.clientY;
    });
    
    document.addEventListener('mouseup', () => {
      this.isDragging = false;
    });
    
    // ESC键关闭预览
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isVisible()) {
        this.hide();
      }
    });
  }

  /**
   * 显示图片预览
   * @param {string} imageUrl - 图片URL
   */
  show(imageUrl) {
    // 重置缩放和位置
    this.resetZoom();
    
    // 设置图片源
    this.image.src = imageUrl;
    
    // 显示预览
    this.container.style.display = 'flex';
    
    // 图片加载完成后居中显示
    this.image.onload = () => {
      this.resetZoom();
    };
  }

  /**
   * 隐藏图片预览
   */
  hide() {
    this.container.style.display = 'none';
  }

  /**
   * 检查预览是否可见
   * @returns {boolean} 是否可见
   */
  isVisible() {
    return this.container.style.display === 'flex';
  }

  /**
   * 放大图片
   */
  zoomIn() {
    if (this.scale >= this.maxScale) return;
    
    this.scale += this.scaleStep;
    this.updateZoom();
  }

  /**
   * 缩小图片
   */
  zoomOut() {
    if (this.scale <= this.minScale) return;
    
    this.scale -= this.scaleStep;
    this.updateZoom();
  }

  /**
   * 重置缩放
   */
  resetZoom() {
    this.scale = 1;
    this.imageX = 0;
    this.imageY = 0;
    this.updateZoom();
    this.updateImagePosition();
  }

  /**
   * 更新缩放
   */
  updateZoom() {
    // 更新图片缩放
    this.image.style.transform = `translate(${this.imageX}px, ${this.imageY}px) scale(${this.scale})`;
    
    // 更新缩放比例显示
    this.updateZoomLevel();
  }

  /**
   * 更新图片位置
   */
  updateImagePosition() {
    this.image.style.transform = `translate(${this.imageX}px, ${this.imageY}px) scale(${this.scale})`;
  }

  /**
   * 更新缩放比例显示
   */
  updateZoomLevel() {
    const percentage = Math.round(this.scale * 100);
    this.zoomLevel.textContent = `${percentage}%`;
  }

  /**
   * 销毁预览器
   */
  destroy() {
    // 移除DOM元素
    if (this.container && this.container.parentNode) {
      document.body.removeChild(this.container);
    }
    
    // 清理事件监听
    this.zoomInButton.removeEventListener('click', this.zoomIn);
    this.zoomOutButton.removeEventListener('click', this.zoomOut);
    this.resetButton.removeEventListener('click', this.resetZoom);
    this.closeButton.removeEventListener('click', this.hide);
    
    // 清理引用
    this.container = null;
    this.imageContainer = null;
    this.image = null;
    this.toolbar = null;
    this.zoomInButton = null;
    this.zoomOutButton = null;
    this.zoomLevel = null;
    this.resetButton = null;
    this.closeButton = null;
  }
}

export default IframeImagePreview; 