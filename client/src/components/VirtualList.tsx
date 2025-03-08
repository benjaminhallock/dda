import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';

interface VirtualListProps<T> {
  items: T[];
  height: number;
  itemHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number;
  className?: string;
  itemClassName?: string;
  animateItems?: boolean;
}

export function VirtualList<T>({
  items,
  height,
  itemHeight,
  renderItem,
  overscan = 3,
  className = '',
  itemClassName = '',
  animateItems = false
}: VirtualListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const totalHeight = items.length * itemHeight;
  const visibleItems = Math.ceil(height / itemHeight);
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(items.length - 1, Math.floor((scrollTop + height) / itemHeight) + overscan);
  
  const handleScroll = useCallback(() => {
    if (scrollRef.current) {
      setScrollTop(scrollRef.current.scrollTop);
    }
  }, []);
  
  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (scrollElement) {
      scrollElement.addEventListener('scroll', handleScroll);
      return () => scrollElement.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);
  
  return (
    <div
      ref={scrollRef}
      className={`overflow-auto ${className}`}
      style={{ height }}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {items.slice(startIndex, endIndex + 1).map((item, idx) => {
          const index = startIndex + idx;
          const top = index * itemHeight;
          
          return animateItems ? (
            <motion.div
              key={index}
              className={`absolute w-full ${itemClassName}`}
              style={{ top, height: itemHeight }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: idx * 0.03 }}
            >
              {renderItem(item, index)}
            </motion.div>
          ) : (
            <div
              key={index}
              className={`absolute w-full ${itemClassName}`}
              style={{ top, height: itemHeight }}
            >
              {renderItem(item, index)}
            </div>
          );
        })}
      </div>
    </div>
  );
}
