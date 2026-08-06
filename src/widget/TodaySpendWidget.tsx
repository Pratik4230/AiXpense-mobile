'use no memo';

import React from "react";
import { FlexWidget, TextWidget } from "react-native-android-widget";
import type { TodaySpendSnapshot } from "@/widget/todaySpend";

type Props = {
  data: TodaySpendSnapshot;
};

function formatAmount(data: TodaySpendSnapshot): string {
  try {
    return new Intl.NumberFormat("en", {
      style: "currency",
      currency: data.currencyCode || "INR",
      maximumFractionDigits: 0,
    }).format(data.total);
  } catch {
    return `${data.symbol || "₹"}${Math.round(data.total).toLocaleString("en")}`;
  }
}

/**
 * Android home-screen widget — today's expense total.
 * Must only use react-native-android-widget primitives (no RN View/Text, no hooks).
 */
export function TodaySpendWidget({ data }: Props) {
  const title =
    data.status === "signed_out"
      ? "Sign in"
      : data.status === "error"
        ? "—"
        : formatAmount(data);

  const subtitle =
    data.status === "signed_out"
      ? "Open AiXpense to sync"
      : data.status === "error"
        ? "Tap to open app"
        : data.count === 1
          ? "1 expense today"
          : `${data.count} expenses today`;

  return (
    <FlexWidget
      clickAction="OPEN_APP"
      style={{
        height: "match_parent",
        width: "match_parent",
        backgroundColor: "#0a0a0a",
        borderRadius: 20,
        padding: 14,
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <TextWidget
        text="AiXpense"
        style={{
          fontSize: 12,
          color: "#a3a3a3",
        }}
      />
      <FlexWidget
        style={{
          flexDirection: "column",
          flexGap: 2,
        }}
      >
        <TextWidget
          text="Today"
          style={{
            fontSize: 13,
            color: "#737373",
          }}
        />
        <TextWidget
          text={title}
          style={{
            fontSize: 26,
            color: "#fafafa",
            fontWeight: "700",
          }}
          truncate="END"
          maxLines={1}
        />
      </FlexWidget>
      <TextWidget
        text={subtitle}
        style={{
          fontSize: 11,
          color: "#737373",
        }}
        truncate="END"
        maxLines={1}
      />
    </FlexWidget>
  );
}
