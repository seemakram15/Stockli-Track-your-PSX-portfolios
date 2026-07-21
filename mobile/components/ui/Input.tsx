import { TextInput, View, type TextInputProps } from "react-native";
import { useColors } from "@/lib/theme";
import { ThemedText } from "./ThemedText";

export function Input({
  label,
  error,
  className = "",
  ...props
}: TextInputProps & { label?: string; error?: string; className?: string }) {
  const c = useColors();
  return (
    <View className="gap-1.5">
      {label ? <ThemedText variant="label">{label}</ThemedText> : null}
      <TextInput
        placeholderTextColor={c.muted}
        className={`h-13 rounded-2xl border border-border bg-card px-4 text-[15px] text-fg focus:border-primary ${className}`}
        {...props}
      />
      {error ? <ThemedText variant="caption" className="text-loss">{error}</ThemedText> : null}
    </View>
  );
}
