/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  description?: string;
  badge?: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  className?: string;
  required?: boolean;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Selecione uma opção...',
  label,
  disabled = false,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  // Fecha o dropdown se clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5 font-serif-brand">
          {label}
        </label>
      )}

      {/* Botão de disparo com bordas arredondadas (rounded-2xl) */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full py-3 pl-4 pr-10 text-left rounded-2xl bg-white border transition-all shadow-xs flex items-center justify-between cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#c082a0]/40 focus:border-[#c082a0] ${
          isOpen
            ? 'border-[#c082a0] ring-2 ring-[#c082a0]/30 shadow-md'
            : 'border-[#e8dfe4] hover:border-[#d9c5cf]'
        } ${disabled ? 'opacity-50 cursor-not-allowed bg-stone-100' : ''}`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="truncate pr-2">
          {selectedOption ? (
            <span className="text-stone-800 text-xs sm:text-sm font-medium">
              {selectedOption.label}
            </span>
          ) : (
            <span className="text-stone-400 text-xs sm:text-sm">
              {placeholder}
            </span>
          )}
        </div>

        <div className="absolute inset-y-0 right-0 flex items-center pr-3.5 pointer-events-none text-[#c082a0]">
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          />
        </div>
      </button>

      {/* Caixa de opções aberta com bordas arredondadas (rounded-2xl) */}
      {isOpen && (
        <div 
          className="absolute z-50 mt-1.5 w-full bg-white rounded-2xl border border-[#ede5e9] shadow-2xl py-1.5 max-h-64 overflow-y-auto ring-1 ring-black/5 animate-in fade-in zoom-in-98 duration-150"
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: '#e0c4d2 transparent',
          }}
          role="listbox"
        >
          {options.length === 0 ? (
            <div className="px-4 py-3 text-xs text-stone-400 text-center">
              Nenhuma opção disponível
            </div>
          ) : (
            <div className="px-1.5 space-y-0.5">
              {options.map(option => {
                const isSelected = option.value === value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleSelect(option.value)}
                    className={`w-full px-3 py-2.5 rounded-xl text-left text-xs sm:text-sm font-medium transition-all flex items-center justify-between group cursor-pointer ${
                      isSelected
                        ? 'bg-[#faeef2] text-[#87556e] font-semibold shadow-xs'
                        : 'text-stone-700 hover:bg-[#fbf4f7] hover:text-[#87556e]'
                    }`}
                    role="option"
                    aria-selected={isSelected}
                  >
                    <div className="flex-1 min-w-0 pr-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="truncate">{option.label}</span>
                        {option.badge && (
                          <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-[#faeef2] text-[#c082a0] border border-[#f0dbe5]">
                            {option.badge}
                          </span>
                        )}
                      </div>
                      {option.description && (
                        <p className="text-[11px] text-stone-400 group-hover:text-stone-500 font-normal truncate mt-0.5">
                          {option.description}
                        </p>
                      )}
                    </div>

                    {isSelected && (
                      <Check className="w-4 h-4 text-[#c082a0] shrink-0 ml-1" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
