'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  icon?: React.ReactNode;
}

export function CustomSelect({ options, value, onChange, placeholder = 'Select an option', icon }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="input-field flex items-center justify-between text-left cursor-pointer group"
      >
        <div className="flex items-center space-x-3 overflow-hidden">
          {icon && <div className="shrink-0 text-gray-500 group-hover:text-white transition-colors">{icon}</div>}
          <span className="truncate text-white font-medium">{selectedOption ? selectedOption.label : placeholder}</span>
        </div>
        <ChevronDown size={18} className={`text-gray-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 z-[100] bg-[#12121a]/95 backdrop-blur-xl rounded-xl overflow-hidden shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200 border border-white/10 ring-1 ring-white/5">
          <div className="py-2 max-h-60 overflow-y-auto custom-scrollbar">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 text-sm transition-colors ${
                  value === option.value 
                    ? 'bg-indigo-500/20 text-indigo-400 font-semibold' 
                    : 'text-gray-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span>{option.label}</span>
                {value === option.value && <Check size={14} />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
