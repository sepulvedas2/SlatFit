import React, { useRef, useCallback, useEffect, useState } from "react";
import { ArrowUpIcon, Paperclip } from "lucide-react";
import { cn } from "@/lib/utils";

function useAutoResizeTextarea({ minHeight, maxHeight }) {
  const textareaRef = useRef(null);

  const adjustHeight = useCallback(
    (reset) => {
      const textarea = textareaRef.current;
      if (!textarea) return;
      if (reset) {
        textarea.style.height = `${minHeight}px`;
        return;
      }
      textarea.style.height = `${minHeight}px`;
      const newHeight = Math.max(
        minHeight,
        Math.min(textarea.scrollHeight, maxHeight ?? Infinity)
      );
      textarea.style.height = `${newHeight}px`;
    },
    [minHeight, maxHeight]
  );

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) textarea.style.height = `${minHeight}px`;
  }, [minHeight]);

  useEffect(() => {
    const handleResize = () => adjustHeight();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [adjustHeight]);

  return { textareaRef, adjustHeight };
}

export default function AIChatInput({
  value,
  onChange,
  onSend,
  loading,
  placeholder = "Digite sua mensagem...",
}) {
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: 52,
    maxHeight: 160,
  });

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !loading) onSend();
    }
  };

  const handleChange = (e) => {
    onChange(e.target.value);
    adjustHeight();
  };

  const handleSend = () => {
    if (value.trim() && !loading) {
      onSend();
      adjustHeight(true);
    }
  };

  return (
    <div className="relative rounded-2xl border border-[#CEF17B]/20 bg-white/5 overflow-hidden">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={loading}
        rows={1}
        className={cn(
          "w-full px-4 py-3 pr-12",
          "resize-none bg-transparent",
          "border-none outline-none",
          "text-white text-sm leading-relaxed",
          "placeholder:text-white/40",
          "focus:ring-0 focus:outline-none",
          "min-h-[52px]",
          "disabled:opacity-50"
        )}
        style={{ overflow: "hidden" }}
      />
      <div className="flex items-center justify-end px-3 pb-2">
        <button
          type="button"
          onClick={handleSend}
          disabled={!value.trim() || loading}
          className={cn(
            "p-2 rounded-xl transition-all duration-200 flex items-center justify-center",
            value.trim() && !loading
              ? "bg-[#CEF17B] hover:bg-[#b8d96a] shadow-lg shadow-[#CEF17B]/20"
              : "bg-white/10 opacity-50 cursor-not-allowed"
          )}
        >
          {loading ? (
            <span className="w-4 h-4 border-2 border-[#084734]/60 border-t-[#084734] rounded-full animate-spin block" />
          ) : (
            <ArrowUpIcon
              className={cn(
                "w-4 h-4",
                value.trim() ? "text-[#084734]" : "text-white/60"
              )}
            />
          )}
        </button>
      </div>
    </div>
  );
}