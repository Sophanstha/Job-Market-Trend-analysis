import { useState } from "react";
import { FiKey, FiCheck, FiExternalLink, FiX, FiShield } from "react-icons/fi";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onKeySaved: (key: string) => void;
}

export default function GeminiKeyModal({ isOpen, onClose, onKeySaved }: Props) {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("gemini_api_key") || "");
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    const cleanKey = apiKey.trim();
    if (cleanKey) {
      localStorage.setItem("gemini_api_key", cleanKey);
    } else {
      localStorage.removeItem("gemini_api_key");
    }
    setSaved(true);
    onKeySaved(cleanKey);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 700);
  };

  const handleClear = () => {
    localStorage.removeItem("gemini_api_key");
    setApiKey("");
    onKeySaved("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div
        className="w-full max-w-md rounded-xl p-6 border shadow-2xl relative"
        style={{
          background: "var(--color-surface)",
          borderColor: "var(--color-outline)",
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg transition-colors hover:bg-white/5"
          style={{ color: "var(--color-on-surface-variant)" }}
        >
          <FiX size={16} />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={{
              background: "var(--color-surface-container-high)",
              color: "var(--color-primary)",
            }}
          >
            <FiKey size={16} />
          </div>
          <div>
            <h3
              className="text-sm font-semibold"
              style={{ color: "var(--color-on-surface)" }}
            >
              Assessment Engine Credentials
            </h3>
            <p
              className="text-xs"
              style={{ color: "var(--color-on-surface-variant)" }}
            >
              Google Gemini API key configuration
            </p>
          </div>
        </div>

        <div
          className="p-3.5 rounded-lg mb-4 text-xs leading-relaxed flex items-start gap-2.5 border"
          style={{
            background: "var(--color-surface-container-low)",
            borderColor: "var(--color-outline-variant)",
            color: "var(--color-on-surface-variant)",
          }}
        >
          <FiShield className="shrink-0 mt-0.5" size={14} style={{ color: "var(--color-primary)" }} />
          <div>
            The server automatically uses the key in <span className="font-mono text-white">server/.env</span>.
            Optionally specify a custom key here to override the default for this session.
          </div>
        </div>

        <div className="space-y-2 mb-5">
          <label
            className="block label-precision font-mono text-[10px] uppercase font-bold tracking-wider"
            style={{ color: "var(--color-on-surface-variant)" }}
          >
            Gemini API Key
          </label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="AIzaSy... or leave blank for server .env"
            className="w-full px-3.5 py-2 rounded-lg text-xs outline-none transition-all font-mono"
            style={{
              background: "var(--color-surface-container-lowest)",
              border: "1px solid var(--color-outline)",
              color: "var(--color-on-surface)",
            }}
          />
          <div className="flex items-center justify-between text-xs pt-1">
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 hover:underline text-[11px]"
              style={{ color: "var(--color-on-surface-variant)" }}
            >
              <span>Get API key at Google AI Studio</span>
              <FiExternalLink size={10} />
            </a>
            {apiKey && (
              <button
                type="button"
                onClick={handleClear}
                className="text-xs hover:underline"
                style={{ color: "var(--color-error)" }}
              >
                Clear Custom Key
              </button>
            )}
          </div>
        </div>

        <div className="flex gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 px-3.5 rounded-lg text-xs font-medium border transition-colors hover:bg-white/5"
            style={{
              borderColor: "var(--color-outline)",
              color: "var(--color-on-surface)",
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saved}
            className="flex-1 py-2 px-3.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
            style={{
              background: "var(--color-primary)",
              color: "var(--color-on-primary)",
            }}
          >
            {saved ? (
              <>
                <FiCheck size={14} /> Saved
              </>
            ) : (
              "Save Key"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
