import React from "react";
import { FiAlertCircle, FiRefreshCw } from "react-icons/fi";
interface Props {
  message?: string;
  onRetry?: () => void;
}
const ErrorMessage = ({ message, onRetry }: Props) => {
  return (
    <div
      className="rounded-xl p-6 flex flex-col items-center gap-4 text-center"
      style={{ background: "var(--color-error-container)" }}
    >
      <FiAlertCircle
        size={28}
        style={{ color: "var(--color-on-error-container)" }}
      />
      <p
        className="text-sm font-medium"
        style={{ color: "var(--color-on-error-container)" }}
      >
        {message}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 text-xs label-precision font-bold uppercase tracking-wider px-4 py-2 rounded-lg transition-all"
          style={{
            background: "var(--color-error)",
            color: "var(--color-error-container)",
          }}
        >
          <FiRefreshCw size={12} />
          Try Again
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
