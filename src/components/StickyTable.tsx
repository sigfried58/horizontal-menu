import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import './StickyTable.css';

interface TableData {
  id: number;
  name: string;
  role: string;
  description: string;
  date: string;
}

const dummyData: TableData[] = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  name: `User ${i + 1}`,
  role: i % 2 === 0 ? 'Developer' : 'Designer',
  description: `This is a very long description for user ${i + 1} that should be truncated with an ellipsis and show a tooltip on hover. It contains more text to ensure it overflows the column width and test clipping behavior.`,
  date: new Date().toLocaleDateString(),
}));

interface TooltipState {
  x: number;
  y: number;
  content: string;
  visible: boolean;
}

const StickyTable: React.FC = () => {
  const [activeTooltip, setActiveTooltip] = useState<TooltipState>({
    x: 0,
    y: 0,
    content: '',
    visible: false,
  });

  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setActiveTooltip((prev) => (prev.visible ? { ...prev, visible: false } : prev));
    };

    if (activeTooltip.visible) {
      const wrapper = wrapperRef.current;
      wrapper?.addEventListener('scroll', handleScroll);
      window.addEventListener('scroll', handleScroll);
      window.addEventListener('resize', handleScroll);

      return () => {
        wrapper?.removeEventListener('scroll', handleScroll);
        window.removeEventListener('scroll', handleScroll);
        window.removeEventListener('resize', handleScroll);
      };
    }
  }, [activeTooltip.visible]);

  const handleMouseEnter = (e: React.MouseEvent<HTMLTableCellElement>, content: string) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setActiveTooltip({
      x: rect.left + rect.width / 2,
      y: rect.top,
      content,
      visible: true,
    });
  };

  const handleMouseLeave = () => {
    setActiveTooltip((prev) => ({ ...prev, visible: false }));
  };

  return (
    <div className="table-container">
      <div className="table-wrapper" ref={wrapperRef}>
        <table className="sticky-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Role</th>
              <th>Description</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {dummyData.map((row) => (
              <tr key={row.id}>
                <td>{row.id}</td>
                <td>{row.name}</td>
                <td>{row.role}</td>
                <td
                  className="description-cell"
                  onMouseEnter={(e) => handleMouseEnter(e, row.description)}
                  onMouseLeave={handleMouseLeave}
                >
                  <span className="ellipsis-text">{row.description}</span>
                </td>
                <td>{row.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {activeTooltip.visible &&
        createPortal(
          <div
            className="portal-tooltip"
            style={{
              left: `${activeTooltip.x}px`,
              top: `${activeTooltip.y}px`,
            }}
          >
            {activeTooltip.content}
            <div className="tooltip-arrow" />
          </div>,
          document.body
        )}
    </div>
  );
};

export default StickyTable;
