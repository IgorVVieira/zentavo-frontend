import React, { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";

interface PasswordInputProps {
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  minLength?: number;
  autoFocus?: boolean;
}

const PasswordInput: React.FC<PasswordInputProps> = ({
  id,
  value,
  onChange,
  placeholder = "••••••••",
  required = false,
  minLength,
  autoFocus = false,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">
      <input
        id={id}
        type={showPassword ? "text" : "password"}
        value={value}
        onChange={onChange}
        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent pr-10"
        placeholder={placeholder}
        required={required}
        minLength={minLength}
        autoFocus={autoFocus}
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-0 top-0 px-3 flex items-center justify-center btn-transparent"
      >
        {showPassword ? (
          <FiEyeOff className="text-gray-400 hover:text-white" />
        ) : (
          <FiEye className="text-gray-400 hover:text-white" />
        )}
      </button>
    </div>
  );
};

export default PasswordInput;
