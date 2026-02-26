import { useState } from "react";
import { View, ScrollView, Text } from "react-native";
import {
  Button,
  Card,
  TextField,
  Input,
  Label,
  Separator,
  Spinner,
} from "heroui-native";
import { SafeAreaView } from "@/components/ui";
import { useUniwind } from "uniwind";

export default function HomeScreen() {
  const { theme, hasAdaptiveThemes } = useUniwind();
  const [emailVal, setEmailVal] = useState("");
  const [pwVal, setPwVal] = useState("");

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView contentContainerClassName="p-5 gap-8 pb-16">
        <View>
          <Text className="text-2xl font-bold text-foreground">
            UI Components
          </Text>
          <Text className="text-sm text-muted">
            Theme: {hasAdaptiveThemes ? "system" : theme}
          </Text>
        </View>

        <View className="gap-3">
          <Text className="text-xs font-semibold text-muted uppercase tracking-widest">
            Buttons
          </Text>
          <Card className="gap-3">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button>
            <Button isDisabled>Disabled</Button>
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
          <Text className="text-xs font-semibold text-muted uppercase tracking-widest">
            Inputs
          </Text>
          <Card className="gap-3">
            <TextField>
              <Label>Email</Label>
              <Input
                placeholder="you@example.com"
                value={emailVal}
                onChangeText={setEmailVal}
                keyboardType="email-address"
              />
            </TextField>
            <TextField>
              <Label>Password</Label>
              <Input
                placeholder="••••••••"
                value={pwVal}
                onChangeText={setPwVal}
                secureTextEntry
              />
            </TextField>
            <TextField isInvalid>
              <Label>With Error</Label>
              <Input placeholder="Invalid value" />
            </TextField>
            <TextField isDisabled>
              <Label>Disabled</Label>
              <Input placeholder="Not editable" value="Some value" />
            </TextField>
          </Card>
        </View>

        <View className="gap-3">
          <Text className="text-xs font-semibold text-muted uppercase tracking-widest">
            Card + Separator
          </Text>
          <Card>
            <Text className="text-base font-semibold text-foreground">
              Card title
            </Text>
            <Text className="text-sm text-muted">
              Card subtitle or description text
            </Text>
            <Separator className="my-3" />
            <Text className="text-sm text-foreground">
              Content below separator
            </Text>
          </Card>
        </View>

        <View className="gap-3">
          <Text className="text-xs font-semibold text-muted uppercase tracking-widest">
            Spinner
          </Text>
          <Card className="flex-row gap-6 items-center">
            <Spinner size="sm" />
            <Spinner size="md" />
          </Card>
        </View>

        <View className="gap-3">
          <Text className="text-xs font-semibold text-muted uppercase tracking-widest">
            Color Tokens
          </Text>
          <Card className="gap-2">
            {[
              ["bg-accent", "Accent"],
              ["bg-danger", "Danger"],
              ["bg-success", "Success"],
              ["bg-warning", "Warning"],
              ["bg-surface", "Surface"],
              ["bg-default", "Default"],
            ].map(([cls, label]) => (
              <View key={cls} className="flex-row items-center gap-3">
                <View className={`w-8 h-8 rounded-lg ${cls}`} />
                <Text className="text-sm text-foreground">{label}</Text>
                <Text className="text-xs text-muted ml-auto">{cls}</Text>
              </View>
            ))}
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
