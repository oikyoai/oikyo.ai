/**
 * Liquid Glass Effect - Adapted from shuding/liquid-glass
 * Creates a visible, draggable liquid glass element
 */

function createLiquidGlass() {
  console.log('🌊 Initializing Liquid Glass Effect...');
  
  // Check if already exists
  if (document.getElementById('liquid-glass-container')) {
    console.log('Liquid Glass already exists');
    return;
  }

  // Generate unique ID for this instance
  const uid = Math.random().toString(36).substr(2, 9);
  const filterId = `liquid-glass-filter-${uid}`;

  // Create container
  const container = document.createElement('div');
  container.id = 'liquid-glass-container';
  container.style.cssText = `
    position: fixed;
    top: 20%;
    left: 20%;
    width: 200px;
    height: 200px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 20px;
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    cursor: grab;
    user-select: none;
    z-index: 10000;
    filter: url(#${filterId});
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    transition: transform 0.1s ease-out;
  `;

  // Add some content to make it visible
  container.innerHTML = `
    <div style="
      padding: 20px;
      text-align: center;
      color: rgba(0, 0, 0, 0.7);
      font-family: Inter, sans-serif;
      font-size: 14px;
      font-weight: 500;
    ">
      <div style="margin-bottom: 10px; font-size: 24px;">🌊</div>
      <div>Liquid Glass</div>
      <div style="font-size: 12px; opacity: 0.7; margin-top: 5px;">Drag me around!</div>
    </div>
  `;

  // Create SVG filter
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.style.cssText = `
    position: absolute;
    width: 0;
    height: 0;
    pointer-events: none;
  `;

  svg.innerHTML = `
    <defs>
      <filter id="${filterId}" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="0" result="blur" />
        <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9" result="goo" />
        <feComposite in="SourceGraphic" in2="goo" operator="atop"/>
      </filter>
    </defs>
  `;

  // Add to page
  document.body.appendChild(svg);
  document.body.appendChild(container);

  // Make it draggable
  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let elementX = 0;
  let elementY = 0;

  container.addEventListener('mousedown', (e) => {
    isDragging = true;
    container.style.cursor = 'grabbing';
    startX = e.clientX;
    startY = e.clientY;
    
    const rect = container.getBoundingClientRect();
    elementX = rect.left;
    elementY = rect.top;
    
    e.preventDefault();
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - startX;
    const deltaY = e.clientY - startY;
    
    let newX = elementX + deltaX;
    let newY = elementY + deltaY;
    
    // Constrain to viewport
    const maxX = window.innerWidth - container.offsetWidth;
    const maxY = window.innerHeight - container.offsetHeight;
    
    newX = Math.max(0, Math.min(maxX, newX));
    newY = Math.max(0, Math.min(maxY, newY));
    
    container.style.left = newX + 'px';
    container.style.top = newY + 'px';
    
    // Add subtle blur effect during drag
    const speed = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const blur = Math.min(speed / 10, 3);
    svg.querySelector('feGaussianBlur').setAttribute('stdDeviation', blur);
  });

  document.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false;
      container.style.cursor = 'grab';
      
      // Reset blur
      setTimeout(() => {
        svg.querySelector('feGaussianBlur').setAttribute('stdDeviation', '0');
      }, 100);
    }
  });

  // Add hover effects
  container.addEventListener('mouseenter', () => {
    container.style.transform = 'scale(1.05)';
    container.style.boxShadow = '0 12px 48px rgba(0, 0, 0, 0.15)';
  });

  container.addEventListener('mouseleave', () => {
    if (!isDragging) {
      container.style.transform = 'scale(1)';
      container.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.1)';
    }
  });

  console.log('🌊 Liquid Glass Effect created! You can drag it around the page.');
  
  return {
    element: container,
    svg: svg,
    destroy() {
      container.remove();
      svg.remove();
      console.log('🌊 Liquid Glass Effect destroyed');
    }
  };
}

// Performance and capability checks
function checkCapabilities() {
  const isDesktop = window.innerWidth >= 768; // Lowered threshold for testing
  const supportsBackdropFilter = CSS.supports('backdrop-filter', 'blur(1px)') || CSS.supports('-webkit-backdrop-filter', 'blur(1px)');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  return isDesktop && supportsBackdropFilter && !reducedMotion;
}

class OptimizedLiquidGlass {
  constructor() {
    this.instance = null;
    this.shouldEnable = checkCapabilities();
    
    if (this.shouldEnable) {
      this.init();
    } else {
      console.log('🌊 Liquid Glass disabled: device not compatible or user prefers reduced motion');
    }
  }
  
  init() {
    // Delay to avoid blocking critical rendering
    setTimeout(() => {
      this.instance = createLiquidGlass();
    }, 1000);
  }
  
  destroy() {
    if (this.instance) {
      this.instance.destroy();
      this.instance = null;
    }
  }
}

// Initialize only if conditions are met
if (typeof window !== 'undefined') {
  // Export for potential external control
  window.LiquidGlass = OptimizedLiquidGlass;
  
  // Auto-initialize with performance checks
  let liquidGlassInstance = null;
  
  function initLiquidGlass() {
    if (!liquidGlassInstance) {
      liquidGlassInstance = new OptimizedLiquidGlass();
    }
  }
  
  // Initialize after other critical resources
  function initWithPreferences() {
    // Check user preference (localStorage)
    const userPreference = localStorage.getItem('liquid-glass-enabled');
    if (userPreference === 'false') {
      return; // User has disabled the effect
    }
    
    initLiquidGlass();
  }
  
  if (document.readyState === 'complete') {
    setTimeout(initWithPreferences, 1000);
  } else {
    window.addEventListener('load', () => {
      setTimeout(initWithPreferences, 1000);
    });
  }
  
  // Expose control functions
  window.LiquidGlassControls = {
    enable() {
      console.log('🌊 Enabling Liquid Glass...');
      localStorage.setItem('liquid-glass-enabled', 'true');
      if (!liquidGlassInstance) {
        liquidGlassInstance = new OptimizedLiquidGlass();
      }
    },
    disable() {
      console.log('🌊 Disabling Liquid Glass...');
      localStorage.setItem('liquid-glass-enabled', 'false');
      if (liquidGlassInstance) {
        liquidGlassInstance.destroy();
        liquidGlassInstance = null;
      }
    },
    toggle() {
      const isEnabled = localStorage.getItem('liquid-glass-enabled') !== 'false';
      if (isEnabled) {
        this.disable();
        console.log('🌊 Liquid Glass toggled OFF');
        return false;
      } else {
        this.enable();
        console.log('🌊 Liquid Glass toggled ON');
        return true;
      }
    },
    create() {
      // Direct creation for testing
      console.log('🌊 Creating Liquid Glass directly...');
      return createLiquidGlass();
    }
  };
  
  // Also expose the create function globally for easy testing
  window.createLiquidGlass = createLiquidGlass;
}