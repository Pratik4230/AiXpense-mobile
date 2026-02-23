import { View, TextInput as RNTextInput, Text, Pressable } from "react-native";
import { useState } from "react";
import { clsx } from "clsx";

interface InputProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  error?: string;
  secureTextEntry?: boolean;
  keyboardType?: RNTextInput["props"]["keyboardType"];
  autoCapitalize?: RNTextInput["props"]["autoCapitalize"];
  autoComplete?: RNTextInput["props"]["autoComplete"];
  editable?: boolean;
  className?: string;
}

export function Input({
  label,
  placeholder,
  value,
  onChangeText,
  error,
  secureTextEntry,
  keyboardType,
  autoCapitalize = "none",
  autoComplete,
  editable = true,
  className,
}: InputProps) {
  const [secure, setSecure] = useState(secureTextEntry ?? false);
  const [focused, setFocused] = useState(false);

  return (
    <View className={clsx("gap-1.5", className)}>
      {label && (
        <Text className="text-sm font-medium text-foreground">{label}</Text>
      )}
      <View
        className={clsx(
          "flex-row items-center rounded-xl border bg-background px-3",
          focused ? "border-primary" : "border-border",
          error && "border-destructive",
          !editable && "opacity-50",
        )}
      >
        <RNTextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#71717a"
          secureTextEntry={secure}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoComplete={autoComplete}
          editable={editable}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="flex-1 py-3 text-base text-foreground"
        />
        {secureTextEntry && (
          <Pressable
            onPress={() => setSecure((prev) => !prev)}
            className="pl-2 py-3"
          >
            <Text className="text-xs text-muted-foreground">
              {secure ? "Show" : "Hide"}
            </Text>
          </Pressable>
        )}
      </View>
      {error && <Text className="text-xs text-destructive">{error}</Text>}
    </View>
  );
}
