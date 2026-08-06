import React from "react";
import type { WidgetTaskHandlerProps } from "react-native-android-widget";
import { TodaySpendWidget } from "@/widget/TodaySpendWidget";
import {
  TODAY_SPEND_WIDGET_NAME,
  readCachedTodaySpend,
  refreshTodaySpendSnapshot,
} from "@/widget/todaySpend";

async function renderTodaySpend(props: WidgetTaskHandlerProps) {
  // Prefer a fresh fetch; fall back to cache inside refreshTodaySpendSnapshot
  const data = await refreshTodaySpendSnapshot().catch(() =>
    readCachedTodaySpend(),
  );
  props.renderWidget(<TodaySpendWidget data={data} />);
}

export async function widgetTaskHandler(props: WidgetTaskHandlerProps) {
  if (props.widgetInfo.widgetName !== TODAY_SPEND_WIDGET_NAME) {
    return;
  }

  switch (props.widgetAction) {
    case "WIDGET_ADDED":
    case "WIDGET_UPDATE":
    case "WIDGET_RESIZED":
      await renderTodaySpend(props);
      break;
    case "WIDGET_CLICK":
      // OPEN_APP is handled natively; refresh on any custom click
      await renderTodaySpend(props);
      break;
    case "WIDGET_DELETED":
      break;
    default:
      break;
  }
}
