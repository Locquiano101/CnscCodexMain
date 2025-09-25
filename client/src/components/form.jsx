import { useState, useEffect } from "react";
import { ReusableFileUpload } from "./file_manager";
import { FileUp } from "lucide-react";

// TextField Component
export const TextFieldComponent = ({
  label,
  value,
  onChange,
  type = "text",
  placeholder = "",
  required = false,
  error = "",
  transform = null,
}) => {
  return (
    <div className={`space-y-2 px-3 py-2 bg-white rounded-2xl`}>
      <label className="block text-sm font-semibold text- ">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => {
          const newValue = transform
            ? transform(e.target.value)
            : e.target.value;
          onChange(newValue);
        }}
        placeholder={placeholder}
        required={required}
        className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 ${
          error
            ? "border-red-400 bg-red-50"
            : "border-gray-200 bg-gray-50 hover:border-gray-300"
        }`}
      />
      {error && (
        <p className="text-red-500 text-sm font-medium flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
};

// DropDown Component
export const DropDownComponent = ({
  label,
  value,
  onChange,
  options = [],
  placeholder = "",
  required = false,
  error = "",
  className = "",
  searchable = true,
}) => {
  const [query, setQuery] = useState("");
  const [showOptions, setShowOptions] = useState(false);
  const [internalError, setInternalError] = useState(error);

  // For searchable dropdown - filter options based on query
  const filteredOptions = searchable
    ? options.filter((option) => {
        const label = typeof option === "string" ? option : option.label;
        return label.toLowerCase().includes(query.toLowerCase());
      })
    : options;

  // Sync external value and error
  useEffect(() => {
    if (searchable) {
      const displayValue =
        typeof value === "string" ? value : value?.label || "";
      setQuery(displayValue);
    }
    setInternalError(error);
  }, [value, error, searchable]);

  const handleSearchChange = (e) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    setShowOptions(true);

    if (internalError) setInternalError("");
  };

  const handleSelect = (option) => {
    const selectedValue = typeof option === "string" ? option : option.value;
    const displayValue = typeof option === "string" ? option : option.label;

    setQuery(displayValue);
    setShowOptions(false);

    onChange(selectedValue);
    setInternalError("");
  };

  const handleBlur = () => {
    if (searchable) {
      // Delay to allow option selection
      setTimeout(() => {
        setShowOptions(false);
        if (required && !query.trim()) {
          setInternalError("This field is required");
        }
      }, 150);
    }
  };

  const handleFocus = () => {
    if (searchable) {
      setShowOptions(true);
      if (internalError) setInternalError("");
    }
  };

  return (
    <div>
      {label && (
        <label className="block text-sm font-semibold text-gray-800">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div className="relative">
        {searchable ? (
          // Searchable input
          <input
            type="text"
            value={query}
            onChange={handleSearchChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={
              required
                ? `${placeholder || `Search ${label || "options"}`} *`
                : placeholder || `Search ${label || "options"}`
            }
            required={required}
            className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 bg-white ${
              internalError
                ? "border-red-400 bg-red-50"
                : "border-gray-200 bg-gray-50 hover:border-gray-300"
            }`}
          />
        ) : (
          // Regular select
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            required={required}
            className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 appearance-none bg-white ${
              internalError
                ? "border-red-400 bg-red-50"
                : "border-gray-200 bg-gray-50 hover:border-gray-300"
            }`}
          >
            <option value="">
              {placeholder || `Select ${label || "option"}`}
            </option>
            {options.map((option, index) => (
              <option
                key={
                  typeof option === "string" ? option : option.value || index
                }
                value={typeof option === "string" ? option : option.value}
              >
                {typeof option === "string" ? option : option.label}
              </option>
            ))}
          </select>
        )}

        {/* Dropdown arrow icon */}
        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
          <svg
            className="w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>

        {/* Searchable dropdown options */}
        {searchable && showOptions && (
          <ul className="absolute z-10 w-full bg-white text-black border-2 border-gray-200 rounded-xl max-h-60 overflow-auto mt-1 shadow-lg">
            {filteredOptions.length === 0 ? (
              <li className="px-4 py-3 text-gray-500">No results found</li>
            ) : (
              filteredOptions.map((option, index) => {
                const displayValue =
                  typeof option === "string" ? option : option.label;
                const optionValue =
                  typeof option === "string" ? option : option.value;

                return (
                  <li
                    key={optionValue || index}
                    onMouseDown={() => handleSelect(option)}
                    className="px-4 py-3 hover:bg-blue-50 cursor-pointer transition-colors duration-150 border-b border-gray-100 last:border-b-0"
                  >
                    {displayValue}
                  </li>
                );
              })
            )}
          </ul>
        )}
      </div>

      {/* Error message */}
      {internalError && (
        <p className="text-red-500 text-sm font-medium flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {internalError}
        </p>
      )}
    </div>
  );
};

// Radio Component
export const RadioComponent = ({
  label,
  value,
  onChange,
  options = [],
  required = false,
  error = "",
  className = "",
  layout = "vertical", // "vertical" or "horizontal"
}) => {
  return (
    <div className={`space-y-2 px-3 py-2 bg-white rounded-2xl`}>
      <label className="block text-sm font-semibold text-gray-800">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div
        className={`space-y-3 ${
          layout === "horizontal" ? "flex space-x-6 space-y-0" : ""
        }`}
      >
        {options.map((option) => (
          <label
            key={option.value}
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <div className="relative">
              <input
                type="radio"
                name={label}
                value={option.value}
                checked={value === option.value}
                onChange={(e) => onChange(e.target.value)}
                required={required}
                className="sr-only"
              />
              <div
                className={`w-5 h-5 rounded-full border-2 transition-all duration-200 ${
                  value === option.value
                    ? "border-blue-500 bg-blue-500"
                    : "border-gray-300 bg-white group-hover:border-blue-300"
                }`}
              >
                {value === option.value && (
                  <div className="w-2 h-2 bg-white rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
                )}
              </div>
            </div>
            <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
              {option.label}
            </span>
          </label>
        ))}
      </div>
      {error && (
        <p className="text-red-500 text-sm font-medium flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
};

export const Demo = () => {
  const [textValue, setTextValue] = useState("");
  const [selectValue, setSelectValue] = useState("");
  const [radioValue, setRadioValue] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState({});

  const selectOptions = [
    { value: "option1", label: "Option 1" },
    { value: "option2", label: "Option 2" },
    { value: "option3", label: "Option 3" },
  ];

  const radioOptions = [
    { value: "yes", label: "Yes" },
    { value: "no", label: "No" },
    { value: "maybe", label: "Maybe" },
  ];

  const fileFields = {
    "org logo": { label: "Organization Logo", accept: "image/*" },
  };

  const handleFileChange = (fieldKey, files) => {
    if (!files || files.length === 0 || !files[0]) {
      setUploadedFiles((prev) => {
        const updated = { ...prev };
        delete updated[fieldKey];
        return updated;
      });
      return;
    }
    setUploadedFiles((prev) => ({ ...prev, [fieldKey]: files[0] }));
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8 bg-gray-100 min-h-screen">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Individual Input Components
        </h1>
        <p className="text-gray-600">
          Each component can be used independently with custom styling
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <TextField
          label="Full Name"
          value={textValue}
          onChange={setTextValue}
          placeholder="Enter your full name"
          required
          error={
            textValue.length > 0 && textValue.length < 3
              ? "Name must be at least 3 characters"
              : ""
          }
        />

        <DropDown
          label="Select Option"
          value={selectValue}
          onChange={setSelectValue}
          options={selectOptions}
          placeholder="Choose an option"
          required
          error={selectValue === "option1" ? "Option 1 is not available" : ""}
        />

        <Radio
          label="Are you interested?"
          value={radioValue}
          onChange={setRadioValue}
          options={radioOptions}
          layout="horizontal"
          required
        />

        <ReusableFileUpload
          fields={fileFields}
          onFileChange={handleFileChange}
        />
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Current Values:</h3>
        <div className="space-y-2 text-sm">
          <p>
            <strong>Text:</strong> {textValue || "Empty"}
          </p>
          <p>
            <strong>Select:</strong> {selectValue || "None selected"}
          </p>
          <p>
            <strong>Radio:</strong> {radioValue || "None selected"}
          </p>
          <p>
            <strong>File:</strong>{" "}
            {uploadedFiles["org logo"]?.name || "No file selected"}
          </p>
        </div>
      </div>
    </div>
  );
};
