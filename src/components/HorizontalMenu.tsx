import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import './HorizontalMenu.css';

const MENU_OPTIONS = Array.from({ length: 20 }, (_, i) => `Opción ${i + 1}`);

const HorizontalMenu: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [visibleCount, setVisibleCount] = useState<number>(MENU_OPTIONS.length);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [itemWidths, setItemWidths] = useState<number[]>([]);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const moreRef = useRef<HTMLLIElement>(null);

  // Measure all item widths once on mount
  useLayoutEffect(() => {
    if (listRef.current) {
      const widths = Array.from(listRef.current.children).map(child => (child as HTMLElement).offsetWidth);
      // Last item is "más ..." if it exists, but initially we render all 20
      setItemWidths(widths);
    }
  }, []);

  const calculateVisible = () => {
    if (!containerRef.current || itemWidths.length === 0) return;

    const containerWidth = containerRef.current.offsetWidth - 32; // padding offset
    let totalWidth = 0;
    let newVisibleCount = MENU_OPTIONS.length;

    // Check total width
    const totalNeeded = itemWidths.reduce((a, b) => a + b, 0);

    if (totalNeeded <= containerWidth) {
      setVisibleCount(MENU_OPTIONS.length);
      return;
    }

    // Account for "More" width
    const moreWidth = 100; // Estimated or measured width for "más ..."
    const availableWidth = containerWidth - moreWidth;

    for (let i = 0; i < itemWidths.length; i++) {
      if (totalWidth + itemWidths[i] > availableWidth) {
        newVisibleCount = i;
        break;
      }
      totalWidth += itemWidths[i];
    }

    setVisibleCount(newVisibleCount);
  };

  useEffect(() => {
    calculateVisible();
    
    const observer = new ResizeObserver(() => {
      calculateVisible();
    });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [itemWidths]);

  const handleItemClick = (index: number) => {
    setActiveIndex(index);
    setShowDropdown(false);
  };

  const visibleMenuItems = MENU_OPTIONS.slice(0, visibleCount);
  const hiddenMenuItems = MENU_OPTIONS.slice(visibleCount);

  return (
    <div className="menu-container" ref={containerRef}>
      <ul className="menu-list" ref={listRef} style={{ visibility: itemWidths.length === 0 ? 'hidden' : 'visible' }}>
        {/* If we haven't measured yet, render all for measuring */}
        {(itemWidths.length === 0 ? MENU_OPTIONS : visibleMenuItems).map((option, index) => (
          <li
            key={option}
            className={`menu-item ${activeIndex === (itemWidths.length === 0 ? index : index) ? 'active' : ''}`}
            onClick={() => handleItemClick(index)}
          >
            {option}
          </li>
        ))}
        
        {hiddenMenuItems.length > 0 && (
          <li 
            className={`more-item ${activeIndex >= visibleCount ? 'active' : ''}`} 
            ref={moreRef}
            onMouseEnter={() => setShowDropdown(true)}
            onMouseLeave={() => setShowDropdown(false)}
          >
            más ...
            {showDropdown && (
              <div className="dropdown-container">
                {hiddenMenuItems.map((option, index) => {
                  const actualIndex = visibleCount + index;
                  return (
                    <div
                      key={option}
                      className={`dropdown-item ${activeIndex === actualIndex ? 'active' : ''}`}
                      onClick={() => handleItemClick(actualIndex)}
                    >
                      {option}
                    </div>
                  );
                })}
              </div>
            )}
          </li>
        )}
      </ul>
    </div>
  );
};

export default HorizontalMenu;
