"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export function InputField({
  label,
  placeholder,
  type = "text",
  value,
}: {
  label: string;
  placeholder: string;
  type?: string;
  value: string;
}) {
  const [val, setVal] = useState(value);
  const [showPassword, setShowPassword] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="space-y-1.5 text-left w-full">
      <label className="text-sm mb-2 font-semibold text-black/60 dark:text-white/60">
        {label}
      </label>
      <div className="relative flex h-11 items-center rounded-2xl border border-black/15 bg-white px-3.5 dark:border-white/10 dark:bg-white/5">
        <input
          type={type === "password" ? (showPassword ? "text" : "password") : type}
          value={val}
          onFocus={() => {
            if (!isEditing) {
              setVal("");
              setIsEditing(true);
            }
          }}
          onChange={(e) => {
            setVal(e.target.value);
            setIsEditing(true);
          }}
          placeholder={placeholder}
          className="w-full bg-transparent text-sm text-black outline-none placeholder:text-black/30 dark:text-white dark:placeholder:text-white/30"
        />
        {type === "password" && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white cursor-pointer"
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        )}
      </div>
    </div>
  );
}