import { View, type ViewProps } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export function Screen({
  className = "",
  edges = ["top"] as any,
  ...props
}: ViewProps & { className?: string; edges?: any }) {
  return (
    <SafeAreaView
      className={`flex-1 bg-canvas ${className}`}
      edges={edges}
      {...props}
    />
  );
}

export function ThemedView({ className = "", ...props }: ViewProps & { className?: string }) {
  return <View className={`bg-canvas ${className}`} {...props} />;
}

export function Card({ className = "", ...props }: ViewProps & { className?: string }) {
  return (
    <View
      className={`rounded-2xl border border-border bg-card p-4 ${className}`}
      {...props}
    />
  );
}

export function Row({ className = "", ...props }: ViewProps & { className?: string }) {
  return <View className={`flex-row items-center ${className}`} {...props} />;
}
