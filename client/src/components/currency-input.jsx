import React from "react";

/**
 * CurrencyInput - A reusable input with a left-aligned currency prefix and optional label icon.
 *
 * Props:
 * - label: string | ReactNode (label text)
 * - Icon: React.ComponentType (optional lucide icon component)
 * - name, value, onChange, required, placeholder
 * - prefix: string (default: "₱")
 * - type: string (default: "text")
 * - inputMode: string (default: "decimal")
 * - inputClassName: string - extra classes for input
 * - labelClassName: string - extra classes for label
 * - containerClassName: string - wrapper div classes
 * - error: string - when provided, shows an error message below input
 * - autoComplete: string (optional)
 * - min, max, step: pass-through for numeric inputs
 */
export default function CurrencyInput({
  label,
  Icon,
  name,
  value,
  onChange,
  required,
  placeholder = "0.00",
  prefix = "₱",
  type = "text",
  inputMode = "decimal",
  inputClassName = "",
  labelClassName = "",
  containerClassName = "",
  error,
  autoComplete,
  min,
  max,
  step,
}) {
  return (
    <div className={containerClassName}>
      {label !== undefined && (
        <label className={`block text-sm font-semibold text-gray-700 mb-2 ${labelClassName}`}>
          {Icon ? <Icon className="inline h-4 w-4 mr-2" /> : null}
          {label}
        </label>
      )}
      <div className="relative">
        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-gray-500">
          {prefix}
        </span>
        <input
          type={type}
          inputMode={inputMode}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
          autoComplete={autoComplete}
          min={min}
          max={max}
          step={step}
          className={`w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 ${inputClassName}`}
        />
      </div>
      {error ? <p className="text-red-500 text-sm mt-1">{error}</p> : null}
    </div>
  );
}
