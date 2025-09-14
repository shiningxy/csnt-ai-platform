import { useState, useEffect } from 'react';

// 计算颜色亮度（0~1，越接近1越亮）
const getLuminance = (color: string): number => {
  // 支持 rgb, rgba, hex
  let r, g, b;

  if (color.startsWith('#')) {
    // Hex 转 RGB
    const hex = color.replace('#', '');
    r = parseInt(hex.length === 3 ? hex[0] + hex[0] : hex.slice(0, 2), 16);
    g = parseInt(hex.length === 3 ? hex[1] + hex[1] : hex.slice(2, 4), 16);
    b = parseInt(hex.length === 3 ? hex[2] + hex[2] : hex.slice(4, 6), 16);
  } else if (color.startsWith('rgb')) {
    const matches = color.match(/[\d.]+/g);
    if (!matches) return 0.5;
    r = parseFloat(matches[0]);
    g = parseFloat(matches[1]);
    b = parseFloat(matches[2]);
  } else if (color.startsWith('hsl')) {
    // 处理 HSL 颜色
    const matches = color.match(/[\d.]+/g);
    if (!matches || matches.length < 3) return 0.5;
    const h = parseFloat(matches[0]) / 360;
    const s = parseFloat(matches[1]) / 100;
    const l = parseFloat(matches[2]) / 100;
    
    // HSL to RGB 转换
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h * 6) % 2 - 1));
    const m = l - c / 2;
    
    let rTemp, gTemp, bTemp;
    if (h < 1/6) [rTemp, gTemp, bTemp] = [c, x, 0];
    else if (h < 2/6) [rTemp, gTemp, bTemp] = [x, c, 0];
    else if (h < 3/6) [rTemp, gTemp, bTemp] = [0, c, x];
    else if (h < 4/6) [rTemp, gTemp, bTemp] = [0, x, c];
    else if (h < 5/6) [rTemp, gTemp, bTemp] = [x, 0, c];
    else [rTemp, gTemp, bTemp] = [c, 0, x];
    
    r = (rTemp + m) * 255;
    g = (gTemp + m) * 255;
    b = (bTemp + m) * 255;
  } else {
    return 0.5; // 默认中间值
  }

  // 计算相对亮度（ITU Rec. BT.709 标准）
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
};

// 判断是否应使用浅色文字（背景较暗时）
const shouldUseLightText = (luminance: number): boolean => {
  // 通常：背景亮度 < 0.8 → 用浅色文字；>= 0.8 → 用深色文字
  return luminance < 0.8;
};

export const useHeaderTheme = () => {
  const [isDarkBackground, setIsDarkBackground] = useState(true); // 默认深色背景
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrollY(currentScrollY);

      // ✅ 核心修改：获取 Header 后方实际背景色
      // 你可以指定特定容器，比如 #main 或 body，根据你的页面结构调整
      const backgroundElement = document.querySelector('main') || document.body;
      const computedStyle = window.getComputedStyle(backgroundElement);
      let bgColor = computedStyle.backgroundColor;

      // 如果是透明或未设置，尝试获取 body 背景色
      if (bgColor === 'rgba(0, 0, 0, 0)' || bgColor === 'transparent' || !bgColor) {
        const bodyStyle = window.getComputedStyle(document.body);
        bgColor = bodyStyle.backgroundColor;
        
        // 如果 body 也是透明，尝试获取 html 背景色
        if (bgColor === 'rgba(0, 0, 0, 0)' || bgColor === 'transparent' || !bgColor) {
          const htmlStyle = window.getComputedStyle(document.documentElement);
          bgColor = htmlStyle.backgroundColor;
        }
      }

      // 如果仍然无法获取背景色，检查CSS变量
      if (bgColor === 'rgba(0, 0, 0, 0)' || bgColor === 'transparent' || !bgColor) {
        const rootStyle = getComputedStyle(document.documentElement);
        const bgVar = rootStyle.getPropertyValue('--background').trim();
        if (bgVar) {
          bgColor = `hsl(${bgVar})`;
        }
      }

      // 计算亮度并设置主题
      if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent') {
        const luminance = getLuminance(bgColor);
        setIsDarkBackground(shouldUseLightText(luminance));
      } else {
        // 如果无法获取背景色，回退到滚动距离判断
        const threshold = 100;
        setIsDarkBackground(currentScrollY < threshold);
      }
    };

    // 初始化
    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // 监听可能改变背景色的 DOM 变化（可选增强）
    // 比如 SPA 路由切换、动态主题切换
    const observer = new MutationObserver(handleScroll);
    observer.observe(document.body, { 
      childList: true, 
      subtree: true, 
      attributes: true, 
      attributeFilter: ['class', 'style'] 
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, []);

  // 根据背景深浅返回相应的样式类
  const getHeaderStyles = () => {
    if (isDarkBackground) {
      return {
        headerClass: "fixed top-0 left-0 right-0 z-50 w-full bg-black/10 backdrop-blur-xl border-b border-border/5 transition-all duration-300",
        textClass: "text-foreground-light",
        logoTextClass: "text-foreground-light",
        subtitleClass: "text-foreground-light/70",
        iconClass: "text-foreground-light",
        buttonClass: "text-foreground-light/90 hover:text-foreground-light hover:bg-foreground-light/10",
        activeButtonClass: "bg-foreground-light/20 text-foreground-light",
      };
    } else {
      return {
        headerClass: "fixed top-0 left-0 right-0 z-50 w-full bg-white/80 backdrop-blur-xl border-b border-border/20 transition-all duration-300",
        textClass: "text-foreground",
        logoTextClass: "text-foreground",
        subtitleClass: "text-muted-foreground",
        iconClass: "text-foreground",
        buttonClass: "text-foreground/90 hover:text-foreground hover:bg-accent/50",
        activeButtonClass: "bg-accent text-accent-foreground",
      };
    }
  };

  return {
    isDarkBackground,
    scrollY,
    ...getHeaderStyles(),
  };
};