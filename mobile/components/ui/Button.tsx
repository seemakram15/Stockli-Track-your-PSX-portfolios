import { Pressable, Text, ActivityIndicator, type PressableProps } from "react-native";
import { useColors } from "@/lib/theme";

type Variant = "primary" | "secondary" | "ghost" | "destructive";

const base = "flex-row items-center justify-center gap-2 rounded-2xl px-5 py-4";

const variants: Record<Variant, { container: string; text: string }> = {
  primary:     { container: "bg-primary active:opacity-80", text: "font-bold text-[15px] text-[#04100d]" },
  secondary:   { container: "bg-card border border-border active:opacity-70", text: "text-fg font-semibold text-[15px]" },
  ghost:       { container: "active:bg-card", text: "text-primary font-semibold text-[15px]" },
  destructive: { container: "bg-loss/15 border border-loss/30 active:opacity-70", text: "text-loss font-semibold text-[15px]" },
};

export function Button({
  variant = "primary",
  label,
  loading = false,
  className = "",
  ...props
}: PressableProps & {
  variant?: Variant;
  label: string;
  loading?: boolean;
  className?: string;
}) {
  const c = useColors();
  const v = variants[variant];
  return (
    <Pressable className={`${base} ${v.container} ${className}`} {...props}>
      {loading ? (
        <ActivityIndicator color={variant === "primary" ? "#04100d" : c.primary} />
      ) : (
        <Text className={v.text}>{label}</Text>
      )}
    </Pressable>
  );
}
