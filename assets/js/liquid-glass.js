/**
 * Liquid Glass Effect - Performance Optimized
 * Based on shuding/liquid-glass with optimizations for Lighthouse scores
 * Only loads on desktop devices with sufficient performance capabilities
 */

class OptimizedLiquidGlass {
  constructor() {
    this.isEnabled = false;
    this.shader = null;
    this.mouse = { x: 0, y: 0 };
    this.target = { x: 0, y: 0 };
    this.dampening = 0.1;
    this.animationId = null;
    
    // Performance checks
    this.shouldEnable = this.checkPerformanceCapability();
    
    if (this.shouldEnable) {
      this.init();
    }
  }
  
  checkPerformanceCapability() {
    // Only enable on desktop devices with good performance
    const isDesktop = window.innerWidth >= 1024;
    const supportsWebGL = this.checkWebGLSupport();
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const hasGoodConnection = navigator.connection ? navigator.connection.effectiveType !== 'slow-2g' : true;
    
    return isDesktop && supportsWebGL && !reducedMotion && hasGoodConnection;
  }
  
  checkWebGLSupport() {
    try {
      const canvas = document.createElement('canvas');
      return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
    } catch (e) {
      return false;
    }
  }
  
  init() {
    // Wait for page load to avoid blocking critical rendering
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setup());
    } else {
      // Delay initialization to not block main thread
      requestIdleCallback(() => this.setup(), { timeout: 2000 });
    }
  }
  
  setup() {
    this.createShader();
    this.bindEvents();
    this.startAnimation();
    this.isEnabled = true;
  }
  
  createShader() {
    const id = 'liquid-glass-' + Math.random().toString(36).substr(2, 9);
    
    // Create SVG with optimized filters
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 9999;
      mix-blend-mode: multiply;
      opacity: 0.8;
    `;
    
    svg.innerHTML = `
      <defs>
        <filter id="${id}" x="-50%" y="-50%" width="200%" height="200%">
          <feTurbulence id="${id}-turbulence" baseFrequency="0.01 0.01" numOctaves="3" seed="1"/>
          <feDisplacementMap id="${id}-displacement" in="SourceGraphic" scale="20"/>
          <feGaussianBlur stdDeviation="1"/>
          <feColorMatrix values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.3 0"/>
        </filter>
      </defs>
      <rect width="100%" height="100%" filter="url(#${id})" fill="rgba(255,255,255,0.1)"/>
    `;
    
    document.body.appendChild(svg);
    
    this.shader = {
      element: svg,
      turbulence: svg.querySelector(`#${id}-turbulence`),
      displacement: svg.querySelector(`#${id}-displacement`)
    };
  }
  
  bindEvents() {
    // Use passive listeners for better performance
    document.addEventListener('mousemove', (e) => {
      this.target.x = e.clientX / window.innerWidth;
      this.target.y = e.clientY / window.innerHeight;
    }, { passive: true });
    
    // Pause on visibility change
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.pause();
      } else {
        this.resume();
      }
    });
    
    // Clean up on page unload
    window.addEventListener('beforeunload', () => this.destroy());
  }
  
  startAnimation() {
    const animate = () => {
      if (!this.isEnabled) return;
      
      // Smooth interpolation
      this.mouse.x += (this.target.x - this.mouse.x) * this.dampening;
      this.mouse.y += (this.target.y - this.mouse.y) * this.dampening;
      
      // Update shader properties
      if (this.shader.turbulence) {
        const frequency = 0.01 + this.mouse.x * 0.02;
        this.shader.turbulence.setAttribute('baseFrequency', `${frequency} ${frequency}`);
      }
      
      if (this.shader.displacement) {
        const scale = 10 + this.mouse.y * 30;
        this.shader.displacement.setAttribute('scale', scale);
      }
      
      this.animationId = requestAnimationFrame(animate);
    };
    
    animate();
  }
  
  pause() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }
  
  resume() {
    if (this.isEnabled && !this.animationId) {
      this.startAnimation();
    }
  }
  
  destroy() {
    this.pause();
    if (this.shader && this.shader.element) {
      this.shader.element.remove();
    }
    this.isEnabled = false;
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
      localStorage.setItem('liquid-glass-enabled', 'true');
      if (!liquidGlassInstance) {
        initLiquidGlass();
      }
    },
    disable() {
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
      } else {
        this.enable();
      }
      return !isEnabled;
    }
  }
}