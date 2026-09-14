import React, { useState, useMemo, useRef, useEffect } from "react";
import { ChevronDown, Check, Search, X } from "lucide-react";

export interface MobileSelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string;
}

interface MobileSelectPickerProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: (MobileSelectOption | string)[];
  placeholder?: string;
  title?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  buttonClassName?: string;
  icon?: React.ReactNode;
  searchPlaceholder?: string;
  activeColor?: "teal" | "blue" | "indigo" | "purple";
}

export function MobileSelectPicker({
  label,
  value,
  onChange,
  options,
  placeholder = "ఎంచుకోండి (Select)...",
  title,
  required = false,
  disabled = false,
  className = "",
  buttonClassName = "",
  icon,
  searchPlaceholder = "వెతకండి (Search)...",
  activeColor = "teal"
}: MobileSelectPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Normalize options to MobileSelectOption objects
  const normalizedOptions: MobileSelectOption[] = useMemo(() => {
    return options.map((opt) => {
      if (typeof opt === "string") {
        return { value: opt, label: opt };
      }
      return opt;
    });
  }, [options]);

  // Find currently selected option object
  const selectedOption = useMemo(() => {
    return normalizedOptions.find((opt) => opt.value === value);
  }, [normalizedOptions, value]);

  // Filter options based on search query
  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return normalizedOptions;
    const q = searchQuery.toLowerCase().trim();
    return normalizedOptions.filter(
      (opt) =>
        opt.label.toLowerCase().includes(q) ||
        opt.value.toLowerCase().includes(q)
    );
  }, [normalizedOptions, searchQuery]);

  // Focus search input when sheet opens
  useEffect(() => {
    if (isOpen) {
      setSearchQuery("");
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Lock body scroll when modal sheet is open on mobile
  useEffect(() => {
    if (isOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isOpen]);

  // Direct 1-tap select: select and immediately close, NO "OK" button needed
  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
  };

  const ringColorClass =
    activeColor === "blue"
      ? "focus:ring-blue-500 border-blue-500"
      : activeColor === "indigo"
      ? "focus:ring-indigo-500 border-indigo-500"
      : activeColor === "purple"
      ? "focus:ring-purple-500 border-purple-500"
      : "focus:ring-teal-500 border-teal-500";

  const selectedItemBg =
    activeColor === "blue"
      ? "bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-100"
      : activeColor === "indigo"
      ? "bg-indigo-50 dark:bg-indigo-950/50 border-indigo-200 dark:border-indigo-800 text-indigo-900 dark:text-indigo-100"
      : activeColor === "purple"
      ? "bg-purple-50 dark:bg-purple-950/50 border-purple-200 dark:border-purple-800 text-purple-900 dark:text-purple-100"
      : "bg-teal-50 dark:bg-teal-950/50 border-teal-200 dark:border-teal-800 text-teal-900 dark:text-teal-100";

  const checkColor =
    activeColor === "blue"
      ? "text-blue-600"
      : activeColor === "indigo"
      ? "text-indigo-600"
      : activeColor === "purple"
      ? "text-purple-600"
      : "text-teal-600";

  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label className="font-extrabold text-slate-800 dark:text-slate-200 flex items-center justify-between text-xs">
          <span className="flex items-center gap-1">
            {icon}
            <span>{label}</span>
            {required && <span className="text-red-500">*</span>}
          </span>
        </label>
      )}

      {/* Trigger Button - Looks like native select, but opens 1-tap mobile bottom sheet */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(true)}
        className={`w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 p-2.5 text-left text-xs font-bold text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 ${ringColorClass} transition flex items-center justify-between gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${buttonClassName}`}
      >
        <span className="truncate flex items-center gap-1.5 min-w-0">
          {selectedOption?.icon}
          <span className={selectedOption ? "" : "text-slate-400 font-normal"}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </span>
        <ChevronDown className="size-4 text-slate-400 shrink-0" />
      </button>

      {/* Mobile-Friendly Slide-Up Bottom Sheet / Modal (1-Tap Direct Select, NO "OK" Button) */}
      {isOpen && (
        <div className="fixed inset-0 z-[999] flex flex-col justify-end sm:justify-center sm:items-center p-0 sm:p-4 animate-in fade-in duration-150">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsOpen(false)}
          />

          {/* Modal / Bottom Sheet Box */}
          <div className="relative w-full sm:max-w-md bg-white dark:bg-slate-900 rounded-t-[1.75rem] sm:rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[85vh] sm:max-h-[75vh] flex flex-col overflow-hidden z-10 animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200">
            
            {/* Sheet Handle (Mobile visual cue) */}
            <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mt-2.5 sm:hidden" />

            {/* Header */}
            <div className="p-3.5 sm:p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 shrink-0">
              <div className="min-w-0">
                <h3 className="font-black text-sm text-slate-900 dark:text-white truncate">
                  {title || label || "ఎంచుకోండి (Select Option)"}
                </h3>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">
                  ⚡ నేరుగా ట్యాప్ చేయండి (1-Tap to select directly - No OK needed)
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="size-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-500 hover:text-slate-700 dark:text-slate-400 cursor-pointer transition shrink-0"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Optional Search filter if 5+ options */}
            {normalizedOptions.length >= 5 && (
              <div className="p-3 border-b border-slate-100 dark:border-slate-800 shrink-0 bg-slate-50/70 dark:bg-slate-800/40">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 size-3.5 text-slate-400" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={searchPlaceholder}
                    className="w-full pl-8 pr-8 py-2 text-xs font-semibold rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="size-3.5" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Options List */}
            <div className="overflow-y-auto p-2 sm:p-3 space-y-1.5 divide-y divide-slate-100/50 dark:divide-slate-800/50">
              {filteredOptions.length === 0 ? (
                <div className="py-8 text-center text-xs font-semibold text-slate-400">
                  ఏ ఫలితాలు దొరకలేదు (No options found)
                </div>
              ) : (
                filteredOptions.map((opt) => {
                  const isSelected = opt.value === value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handleSelect(opt.value)}
                      className={`w-full text-left p-3 rounded-xl flex items-center justify-between gap-3 text-xs transition cursor-pointer active:scale-[0.99] touch-manipulation ${
                        isSelected
                          ? `${selectedItemBg} font-extrabold border shadow-xs`
                          : "text-slate-800 dark:text-slate-200 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 font-medium"
                      }`}
                    >
                      <span className="flex items-center gap-2 min-w-0">
                        {opt.icon}
                        <span className="truncate">{opt.label}</span>
                      </span>
                      {isSelected && (
                        <Check className={`size-4 shrink-0 ${checkColor}`} />
                      )}
                    </button>
                  );
                })
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
