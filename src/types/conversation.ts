export interface IMessage {
  id: string;
  role: "user" | "assistant";
  parts: object[];
  createdAt: Date;
}

export interface ConversationSummary {
  _id: string;
  title: string;
  messageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationFull extends ConversationSummary {
  messages: IMessage[];
}
