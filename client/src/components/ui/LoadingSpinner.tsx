import { AiOutlineLoading3Quarters } from "react-icons/ai";

interface Props {
  size?: "sm" | "md" | "lg";
  text?: string;
}

const sizes = {
  sm: 16,
  md: 28,
  lg: 40,
};

export default function LoadingSpinner({ size = "md", text }: Props) {
  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <AiOutlineLoading3Quarters
        size={sizes[size]}
        className="animate-spin"
        style={{ color: "var(--color-primary)" }}
      />
      {text && (
        <p
          className="text-sm label-precision"
          style={{ color: "var(--color-on-surface-variant)" }}
        >
          {text}
        </p>
      )}
    </div>
  );
}