import { useState } from "react";
import { View, ScrollView } from "react-native";
import {
  SafeAreaView,
  Text,
  Button,
  Input,
  Card,
  Separator,
  Spinner,
} from "@/components/ui";
import { useUniwind } from "uniwind";

export default function HomeScreen() {
  const { theme, hasAdaptiveThemes } = useUniwind();
  const [inputVal, setInputVal] = useState("");
  const [pwVal, setPwVal] = useState("");

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView contentContainerClassName="p-5 gap-8 pb-16">
        <View>
          <Text variant="heading">UI Components</Text>
          <Text variant="muted">
            Theme: {hasAdaptiveThemes ? "system" : theme}
          </Text>
        </View>

        <View className="gap-3">
          <Text
            variant="label"
            className="text-foreground-secondary uppercase text-xs tracking-widest"
          >
            Text Variants
          </Text>
          <Card>
            <Text variant="heading">Heading</Text>
            <Text variant="subheading">Subheading</Text>
            <Text variant="body">Body text — default style</Text>
            <Text variant="label">Label</Text>
            <Text variant="muted">Muted text</Text>
            <Text variant="caption">Caption text</Text>
          </Card>
        </View>

        <View className="gap-3">
          <Text
            variant="label"
            className="text-foreground-secondary uppercase text-xs tracking-widest"
          >
            Buttons
          </Text>
          <Card className="gap-3">
            <Button>Default (Primary)</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
            <Button loading>Loading</Button>
            <Button disabled>Disabled</Button>
            <View className="flex-row gap-2">
              <Button size="sm" className="flex-1">
                Small
              </Button>
              <Button size="lg" className="flex-1">
                Large
              </Button>
            </View>
          </Card>
        </View>

        <View className="gap-3">
          <Text
            variant="label"
            className="text-foreground-secondary uppercase text-xs tracking-widest"
          >
            Inputs
          </Text>
          <Card className="gap-3">
            <Input
              label="Email"
              placeholder="you@example.com"
              value={inputVal}
              onChangeText={setInputVal}
              keyboardType="email-address"
            />
            <Input
              label="Password"
              placeholder="••••••••"
              value={pwVal}
              onChangeText={setPwVal}
              secureTextEntry
            />
            <Input
              label="With Error"
              placeholder="Invalid value"
              value=""
              error="This field is required"
            />
            <Input
              label="Disabled"
              placeholder="Not editable"
              value="Some value"
              editable={false}
            />
          </Card>
        </View>

        <View className="gap-3">
          <Text
            variant="label"
            className="text-foreground-secondary uppercase text-xs tracking-widest"
          >
            Card + Separator
          </Text>
          <Card>
            <Text variant="label">Card title</Text>
            <Text variant="muted">Card subtitle or description text</Text>
            <Separator className="my-3" />
            <Text variant="body">Content below separator</Text>
          </Card>
        </View>

        <View className="gap-3">
          <Text
            variant="label"
            className="text-foreground-secondary uppercase text-xs tracking-widest"
          >
            Spinner
          </Text>
          <Card className="flex-row gap-6 items-center">
            <Spinner size="small" />
            <Spinner size="large" />
          </Card>
        </View>

        <View className="gap-3">
          <Text
            variant="label"
            className="text-foreground-secondary uppercase text-xs tracking-widest"
          >
            Color Tokens
          </Text>
          <Card className="gap-2">
            {[
              ["bg-primary", "Primary"],
              ["bg-destructive", "Destructive"],
              ["bg-success", "Success"],
              ["bg-warning", "Warning"],
              ["bg-muted", "Muted"],
              ["bg-card", "Card"],
              ["bg-border", "Border"],
            ].map(([cls, label]) => (
              <View key={cls} className="flex-row items-center gap-3">
                <View className={`w-8 h-8 rounded-lg ${cls}`} />
                <Text variant="body">{label}</Text>
                <Text variant="caption" className="ml-auto">
                  {cls}
                </Text>
              </View>
            ))}
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
