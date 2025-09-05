import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MoreVertical } from 'lucide-react';

export interface DropdownMenuItem {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}

interface DropdownMenuProps {
  items: DropdownMenuItem[];
  trigger?: React.ReactNode;
  className?: string;
  align?: 'left' | 'right';
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({
  items,
  trigger,
  className = '',
  align = 'right'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
          triggerRef.current && !triggerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + window.scrollY + 4,
        left: align === 'right' ? rect.right - 192 : rect.left + window.scrollX // 192px is the width of the dropdown (w-48)
      });
    }
  }, [isOpen, align]);

  const handleItemClick = (item: DropdownMenuItem) => {
    if (!item.disabled) {
      item.onClick();
      setIsOpen(false);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <button
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-8 h-8 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
        aria-label="Open menu"
      >
        {trigger || <MoreVertical className="h-4 w-4" />}
      </button>

      {isOpen && createPortal(
        <div
          ref={dropdownRef}
          className="fixed z-50 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1"
          style={{ 
            top: position.top,
            left: position.left,
            zIndex: 9999
          }}
        >
          {items.map((item, index) => (
            <button
              key={index}
              onClick={() => handleItemClick(item)}
              disabled={item.disabled}
              className={`w-full flex items-center px-3 py-2 text-sm text-left hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed ${
                item.className || ''
              }`}
            >
              {item.icon && <span className="mr-2">{item.icon}</span>}
              {item.label}
            </button>
          ))}
        </div>,
        document.body
      )}
    </div>
  );
};

export default DropdownMenu;
