import { useState, useEffect } from 'react';

export const useHeaderTheme = () => {
  const [isDarkBackground, setIsDarkBackground] = useState(true);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrollY(currentScrollY);

      // 检测背景是否为深色
      // 在页面顶部时，通常背景是深色的（如hero section）
      // 滚动一定距离后，背景可能变成浅色
      const threshold = 10; // 滚动阈值
      
      // 可以根据具体页面调整逻辑
      const isDark = currentScrollY < threshold;
      setIsDarkBackground(isDark);
    };

    // 初始检查
    handleScroll();

    // 添加滚动监听
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // 根据背景深浅返回相应的样式类
  const getHeaderStyles = () => {
    if (isDarkBackground) {
      return {
        headerClass: "fixed top-0 left-0 right-0 z-50 w-full bg-background/10 backdrop-blur-xl border-b border-border/5 transition-all duration-300",
        textClass: "text-foreground-light",
        logoTextClass: "text-foreground-light",
        subtitleClass: "text-foreground-light/70",
        iconClass: "text-foreground-light",
        buttonClass: "text-foreground-light/90 hover:text-foreground-light hover:bg-foreground-light/10",
        activeButtonClass: "bg-foreground-light/20 text-foreground-light",
      };
    } else {
      return {
        headerClass: "fixed top-0 left-0 right-0 z-50 w-full bg-background/80 backdrop-blur-xl border-b border-border/20 transition-all duration-300",
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