import { Text, type TextProps } from "react-native";

type Variant = "title" | "subhead" | "body" | "caption" | "label" | "mono";

const variantClass: Record<Variant, string> = {
  title:   "text-[22px] font-bold tracking-tight text-fg",
  subhead: "text-[17px] font-semibold text-fg",
  body:    "text-[15px] text-muted",
  caption: "text-[13px] text-muted",
  label:   "text-[11px] font-bold uppercase tracking-widest text-muted",
  mono:    "text-[13px] font-mono tabular-nums text-fg",
};

export function ThemedText({
  variant = "body",
  className = "",
  ...props
}: TextProps & { variant?: Variant; className?: string }) {
  return <Text className={`${variantClass[variant]} ${className}`} {...props} />;
}
