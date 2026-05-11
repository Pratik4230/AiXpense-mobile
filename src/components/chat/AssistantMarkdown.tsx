import Markdown, { MarkdownIt } from "@ronradtke/react-native-markdown-display";
import multimdTable from "markdown-it-multimd-table";
import * as WebBrowser from "expo-web-browser";
import { useMemo, useCallback } from "react";
import { Linking, StyleSheet } from "react-native";

const assistantMarkdownIt = MarkdownIt({
  html: false,
  typographer: true,
  linkify: true,
  breaks: true,
}).use(multimdTable);

function createMarkdownStyles(isDark: boolean) {
  const fg = isDark ? "#e4e4e7" : "#1f2937";
  const muted = isDark ? "#a1a1aa" : "#6b7280";
  const codeBg = isDark ? "#1c1c1f" : "#f4f4f5";
  const codeBorder = isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)";
  const quoteBg = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)";
  const quoteBorder = isDark ? "#52525b" : "#d4d4d8";
  const link = isDark ? "#fb923c" : "#ea580c";

  return StyleSheet.create({
    body: { width: "100%" },
    text: { color: fg, fontSize: 16, lineHeight: 24 },
    textgroup: {},
    paragraph: {
      marginTop: 4,
      marginBottom: 4,
      flexWrap: "wrap",
      flexDirection: "row",
      width: "100%",
    },
    heading1: {
      flexDirection: "row",
      fontSize: 22,
      fontWeight: "700",
      color: fg,
      marginTop: 8,
      marginBottom: 4,
    },
    heading2: {
      flexDirection: "row",
      fontSize: 19,
      fontWeight: "700",
      color: fg,
      marginTop: 8,
      marginBottom: 4,
    },
    heading3: {
      flexDirection: "row",
      fontSize: 17,
      fontWeight: "700",
      color: fg,
      marginTop: 6,
      marginBottom: 3,
    },
    heading4: {
      flexDirection: "row",
      fontSize: 16,
      fontWeight: "700",
      color: fg,
      marginTop: 6,
      marginBottom: 3,
    },
    heading5: {
      flexDirection: "row",
      fontSize: 15,
      fontWeight: "600",
      color: fg,
      marginTop: 4,
      marginBottom: 2,
    },
    heading6: {
      flexDirection: "row",
      fontSize: 14,
      fontWeight: "600",
      color: muted,
      marginTop: 4,
      marginBottom: 2,
    },
    strong: { fontWeight: "700", color: fg },
    em: { fontStyle: "italic", color: fg },
    s: { textDecorationLine: "line-through", color: muted },
    bullet_list: { marginBottom: 4 },
    ordered_list: { marginBottom: 4 },
    list_item: { flexDirection: "row", marginBottom: 2 },
    bullet_list_icon: { marginLeft: 4, marginRight: 8, color: fg },
    bullet_list_content: { flex: 1 },
    ordered_list_icon: { marginLeft: 4, marginRight: 8, color: fg },
    ordered_list_content: { flex: 1 },
    link: { color: link, textDecorationLine: "underline", marginBottom: -4 },
    blocklink: {
      flex: 1,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderColor: quoteBorder,
    },
    hr: {
      backgroundColor: quoteBorder,
      height: StyleSheet.hairlineWidth,
      marginVertical: 10,
    },
    blockquote: {
      backgroundColor: quoteBg,
      borderLeftWidth: 3,
      borderLeftColor: link,
      paddingHorizontal: 10,
      paddingVertical: 6,
      marginVertical: 6,
    },
    code_inline: {
      borderWidth: 1,
      borderColor: codeBorder,
      backgroundColor: codeBg,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 6,
      fontSize: 14,
      color: fg,
    },
    code_block: {
      borderWidth: 1,
      borderColor: codeBorder,
      backgroundColor: codeBg,
      padding: 12,
      borderRadius: 10,
      marginVertical: 6,
      fontSize: 13,
      color: fg,
    },
    fence: {
      borderWidth: 1,
      borderColor: codeBorder,
      backgroundColor: codeBg,
      padding: 12,
      borderRadius: 10,
      marginVertical: 6,
      fontSize: 13,
      color: fg,
    },
    table: {
      borderWidth: 1,
      borderColor: codeBorder,
      borderRadius: 8,
      marginVertical: 8,
    },
    thead: {},
    tbody: {},
    tr: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderColor: codeBorder,
      flexDirection: "row",
    },
    th: { flex: 1, padding: 8, fontWeight: "700", color: fg },
    td: { flex: 1, padding: 8, color: fg },
    image: { marginVertical: 8, borderRadius: 8 },
  });
}

export type AssistantMarkdownProps = {
  children: string;
  isDark: boolean;
};

export function AssistantMarkdown({ children, isDark }: AssistantMarkdownProps) {
  const markdownStyles = useMemo(() => createMarkdownStyles(isDark), [isDark]);

  const onLinkPress = useCallback((url: string) => {
    if (!url) return false;
    if (/^https?:\/\//i.test(url)) {
      void WebBrowser.openBrowserAsync(url);
    } else {
      void Linking.openURL(url).catch(() => {});
    }
    return false;
  }, []);

  return (
    <Markdown
      markdownit={assistantMarkdownIt}
      mergeStyle
      style={markdownStyles}
      onLinkPress={onLinkPress}
    >
      {children}
    </Markdown>
  );
}
