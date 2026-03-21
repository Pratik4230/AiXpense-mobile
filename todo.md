# Aixpense Mobile - Development Plan

## TOP PRIORITY

- [ ] **Remove manual memoization across entire app** — React 19.1 + React Compiler (`reactCompiler: true`) handles memoization automatically. Strip all `useMemo`, `useCallback`, and `React.memo`/`memo()` from every file. They are redundant and add unnecessary code noise. `useRef` and `useState` should stay.

---

## Stack

- **Framework:** Expo SDK 54 + Expo Router v6
- **Styling:** Tailwind CSS v4 + Uniwind
- **State / API:** TanStack Query v5 + Axios
- **Forms:** react-hook-form + zod
- **Storage:** react-native-mmkv v4
- **AI:** Vercel AI SDK v6 (`ai`, `@ai-sdk/openai`, `@ai-sdk/react`)
- **Package Manager:** Bun

---

## Important Docs & Paths

### Better Auth

- `betterAuth.md` — client setup, session, sign in/out, updateUser, changePassword, revokeSession
- `protectedRoute.md` — protected route pattern with Expo Router

### Vercel AI SDK

- `VercelAiSDK_Expo.md` — useChat, streamText, AI SDK v6 in Expo

### Uniwind / Theme

- `Theme/Globalcss.md` — global.css setup, `@import heroui-native/styles`, CSS vars
- `Theme/ThemeBasic.md` — basic theme setup
- `Theme/CustomThemes.md` — custom theme creation
- `Theme/Useuniwind.md` — `useUniwind()` hook, toggle dark/light, access current theme
- `Theme/UpdateCssVariables.md` — update CSS vars at runtime
- `Theme/AdvanceStyleTheme.md` — advanced styling patterns

### Storage

- `MMKV_V4.md` — react-native-mmkv v4 usage

### HeroUI Native Components (`.heroui-docs/native/components/`)

| Category     | Path                                 | Key components                                                                |
| ------------ | ------------------------------------ | ----------------------------------------------------------------------------- |
| Buttons      | `(buttons)/button.mdx`               | Button, variants, sizes, isIconOnly                                           |
| Buttons      | `(buttons)/close-button.mdx`         | CloseButton                                                                   |
| Forms        | `(forms)/text-field.mdx`             | TextField compound API                                                        |
| Forms        | `(forms)/input.mdx`                  | Input                                                                         |
| Forms        | `(forms)/label.mdx`                  | Label                                                                         |
| Forms        | `(forms)/field-error.mdx`            | FieldError                                                                    |
| Forms        | `(forms)/select.mdx`                 | Select, Select.Item                                                           |
| Forms        | `(forms)/text-area.mdx`              | TextArea                                                                      |
| Forms        | `(forms)/checkbox.mdx`               | Checkbox                                                                      |
| Forms        | `(forms)/radio-group.mdx`            | RadioGroup                                                                    |
| Forms        | `(forms)/search-field.mdx`           | SearchField                                                                   |
| Forms        | `(forms)/input-otp.mdx`              | InputOTP (OTP verification)                                                   |
| Data Display | `(data-display)/chip.mdx`            | Chip — variant: primary/secondary/tertiary/soft, color: accent/danger/warning |
| Layout       | `(layout)/card.mdx`                  | Card, Card.Header, Card.Body, Card.Footer, Card.Title                         |
| Layout       | `(layout)/separator.mdx`             | Separator                                                                     |
| Layout       | `(layout)/surface.mdx`               | Surface                                                                       |
| Media        | `(media)/avatar.mdx`                 | Avatar, Avatar.Image, Avatar.Fallback — requires `alt` prop                   |
| Navigation   | `(navigation)/tabs.mdx`              | Tabs, Tabs.Tab                                                                |
| Navigation   | `(navigation)/list-group.mdx`        | ListGroup — settings-style rows                                               |
| Navigation   | `(navigation)/accordion.mdx`         | Accordion                                                                     |
| Overlays     | `(overlays)/bottom-sheet.mdx`        | BottomSheet compound API                                                      |
| Overlays     | `(overlays)/dialog.mdx`              | Dialog — native replacement for Alert.alert                                   |
| Overlays     | `(overlays)/toast.mdx`               | Toast — notifications                                                         |
| Overlays     | `(overlays)/popover.mdx`             | Popover                                                                       |
| Feedback     | `(feedback)/spinner.mdx`             | Spinner                                                                       |
| Feedback     | `(feedback)/skeleton.mdx`            | Skeleton                                                                      |
| Feedback     | `(feedback)/alert.mdx`               | Alert banner                                                                  |
| Controls     | `(controls)/switch.mdx`              | Switch — toggle                                                               |
| Controls     | `(controls)/slider.mdx`              | Slider                                                                        |
| Utilities    | `(utilities)/pressable-feedback.mdx` | PressableFeedback                                                             |
| Utilities    | `(utilities)/scroll-shadow.mdx`      | ScrollShadow                                                                  |

### HeroUI Native Getting Started

- `.heroui-docs/native/getting-started/` — install, provider setup, theming basics

---

## Phase 0 — Foundation (Core Setup)

- [x] Install dependencies (tanstack-query, axios, mmkv, react-hook-form, zod, date-fns, clsx, tailwind-merge)
- [x] Setup QueryClientProvider
- [x] Setup ThemeProvider (light/dark via system or mmkv preference)
- [x] Finalize folder structure (`src/app`, `src/components`, `src/services`, `src/hooks`, `src/lib`, `src/constants`, `src/types`, `src/utils`)
- [ ] Configure Axios instance (`src/lib/api.ts`) with base URL + auth token interceptor (reads token from mmkv)
- [ ] Setup MMKV storage wrapper (`src/lib/storage.ts`) for token + theme preference
- [ ] Define shared constants (`src/constants/expense.ts` — CATEGORIES, EXPENSE_TYPES mirroring web)

---

## Phase 1 — Authentication

**Screens (`src/app/(auth)/`)**

- [ ] `login.tsx` — Email + password form, validation with zod, error display
- [ ] `signup.tsx` — Name, email, password, confirm password; zod validation
- [ ] `forgot-password.tsx` — Email input, send reset link
- [ ] `reset-password.tsx` — Token from deep link + new password form
- [ ] `verify-email.tsx` — Info screen prompting user to check inbox

**Services / Hooks (`src/services/auth.ts`, `src/hooks/useAuth.ts`)**

- [ ] `POST /api/auth/sign-in/email` — Login
- [ ] `POST /api/auth/sign-up/email` — Register
- [ ] `POST /api/auth/forgot-password` — Send reset email
- [ ] `POST /api/auth/reset-password` — Submit new password
- [ ] `POST /api/auth/sign-out` — Logout + clear mmkv token
- [ ] `GET /api/auth/get-session` — Fetch and hydrate session on app launch
- [ ] Auth guard in root `_layout.tsx` — redirect unauthenticated users to `(auth)/login`
- [ ] App-wide Onboarding flow route for first-time users (moved from Chat phase)

---

## Phase 2 — Tab Navigation & Dashboard Shell

**Navigation (`src/app/(tabs)/_layout.tsx`)**

- [ ] Bottom tab bar with 5 tabs: **Home**, **Transactions**, **AI Chat**, **Reports**, **Settings**
- [ ] Tab icons via `@expo/vector-icons`
- [ ] Theme-aware tab bar colors

**Home / Dashboard (`src/app/(tabs)/index.tsx`)**

- [ ] Greeting with user name
- [ ] Quick stats cards: total spent this month, total income this month, net balance
- [ ] Quick-add expense FAB (floating action button) → opens Add Transaction bottom sheet
- [ ] Recent transactions list (last 5) with type color coding (red = expense, green = income)
- [ ] Budget overview strip (progress bars for active budgets)
- [ ] Navigation shortcuts to Reports and Budgets

---

## Phase 3 — Transactions

**Screens**

- [ ] `src/app/(tabs)/transactions.tsx` — Main transactions list
- [ ] Add Transaction bottom sheet / modal (shared across Home FAB and Transactions tab)
- [ ] No edit/delete (match web behavior)

**Features**

- [ ] Infinite scroll with `useInfiniteQuery` + FlatList `onEndReached`
- [ ] Filters: type (expense/income), category multi-select, date range, amount range
- [ ] Draft/apply filter pattern (filters not applied per-keystroke, requires tap)
- [ ] Sort by: date, amount, category
- [ ] Color-coded amounts
- [ ] Search by description/merchant

**Services (`src/services/transactions.ts`)**

- [ ] `GET /api/transactions` — paginated, filtered, sorted (uses web's existing API)
- [ ] `POST /api/transactions` — create transaction (amount, type, category, description, date)

---

## Phase 4 — Budgets

**Screen (`src/app/(tabs)/budgets.tsx`)**

- [ ] List all budgets with category, limit, spent, and progress bar
- [ ] Add budget bottom sheet: category selector, monthly limit (number input)
- [ ] Edit budget (tap on card → edit sheet)
- [ ] Delete budget (swipe or long-press)
- [ ] Blocked categories (can't create duplicate category budget)
- [ ] AI alert shown after save if budget is near/over limit

**Services (`src/services/budgets.ts`)**

- [ ] `GET /api/budgets`
- [ ] `POST /api/budgets`
- [ ] `PUT /api/budgets/:id`
- [ ] `DELETE /api/budgets/:id`

---

## Phase 5 — Reports & Analytics

**Screen (`src/app/(tabs)/reports.tsx`)**

- [ ] Date range selector: 1m, 3m, 6m, 1y
- [ ] Mode toggle: Expenses / Income (tab-style)
- [ ] Overview cards: total amount, transaction count, top category, largest single transaction
- [ ] Spending Trend chart (line/bar — daily for 1m, monthly for 3m/6m/1y) — use `victory-native` or `react-native-gifted-charts`
- [ ] Category Breakdown chart (donut/pie) with 24 distinct category colors
- [ ] Budget vs Actual progress bars (expense mode only)
- [ ] Top Expenses / Top Income list with "View All" link to filtered Transactions
- [ ] AI Coach Insight Card (Premium feature to show weekly/monthly insights)

**Services (`src/services/reports.ts`)**

- [ ] `GET /api/reports?type=overview&range=&mode=`
- [ ] `GET /api/reports?type=trend&range=&mode=`
- [ ] `GET /api/reports?type=categories&range=&mode=`
- [ ] `GET /api/reports?type=budget-vs-actual&range=`
- [ ] `GET /api/reports?type=top-expenses&range=&mode=`

---

## Phase 6 — AI Chat (AiXpense)

> Priority order: P1 → P2 → P3 → P4. Complete P1 before moving to P2.

---

### P1 — Edit / Delete Broken (Fix First)

The swipe edit/delete on `SavedCard` calls `onAction(prefix)` → `sendMessage({ text: prefix })` in `chat.tsx`, but:

- [ ] **`handleAction` has no trial gating** — must check `freeTrials <= 0` before `sendMessage`; show upgrade dialog if exhausted
- [ ] **No `optimisticDecrement()`** — trial count is not decremented when an action message is sent
- [ ] **`UpdatedCard` has no swipe actions** — after a transaction is updated, the resulting `UpdatedCard` in `MessageList` has no `onEdit`/`onDelete` props; swipe is impossible. Add `onEdit`/`onDelete` (same as `SavedCard`) to `UpdatedCard`
- [ ] **`[ATTACHED_TRANSACTION:]` prefix not stripped in user bubble** — when role is `user` and text contains `[ATTACHED_TRANSACTION:`, rewrite display text to `"Edit: {item} (₹{amount})"` or `"Delete: {item} (₹{amount})"` instead of showing the raw prefix string
- [ ] **`outdatedIds` tracking missing** — after `tool-deleteTransaction` or `tool-updateTransaction` succeeds, add the transaction id to a local `outdatedIds` set; pass it into `SavedCard` and mark card as outdated/stale so user knows it is no longer the current state

---

### P2 — Conversation Persistence (Biggest Missing Feature)

**Services (`src/services/conversations.ts`)**

- [ ] `GET /api/conversations` — list all conversations (`useConversations` hook)
- [ ] `GET /api/conversations/:id` — load full message list (`useConversation(id)` hook)
- [ ] `POST /api/conversations` — create new conversation with auto-title from first user message (`useCreateConversation` mutation)
- [ ] `PUT /api/conversations/:id` — save/update messages after AI response finishes (`useUpdateConversation` mutation)

**`chat.tsx` changes**

- [ ] Accept `conversationId` via route param (`useLocalSearchParams`)
- [ ] On mount: if `conversationId` param exists, fetch conversation and pass `initialMessages` to `useChat`
- [ ] `saveMessages()` logic — triggered when `status` transitions `streaming → ready` and last message is assistant:
  - If no `conversationId`: call `createConversation(title)` then `updateConversation({ id, messages })`
  - If `conversationId` exists: call `updateConversation({ id, messages })`
  - On error containing `"Message limit reached"`: show limit dialog instead
- [ ] Track `conversationIdRef` (ref, not state) to avoid stale closure in `saveMessages`
- [ ] New chat button in header → clears messages + navigates to `/chat` without param
- [ ] `justCreatedConvId` pattern — after create, skip re-fetching messages (prevents reset of in-progress chat)
- [ ] Max message warning toasts — after each AI response check count against `MESSAGE_WARNING_THRESHOLDS`; show toast with remaining count + "New Chat" action button

**Conversation List Bottom Sheet**

- [ ] Bottom sheet (or drawer) accessible from a header button (history icon)
- [ ] List all conversations sorted by `updatedAt` desc
- [ ] Tap to load conversation → navigate with `?c=id`
- [ ] Delete conversation swipe action
- [ ] "New Chat" button at top of the sheet

---

### P3 — Trial / Premium Gating

- [ ] `useTrials` service — `GET /api/trials` (fetch remaining free trials) — only called when user is not premium
- [ ] `useTrialActions` — `optimisticDecrement()` (locally decrement before API confirms) + `invalidateTrials()` (refetch after AI response)
- [ ] Call `optimisticDecrement()` before every `sendMessage` call (text, suggestion, action)
- [ ] Before `sendMessage`: if `!isPremium && freeTrials <= 0` → show upgrade dialog, return early
- [ ] Before `sendMessage`: if `conversationId && messageCount >= MAX_MESSAGES_PER_CONVERSATION - 2` → show limit dialog, return early
- [ ] `TrialStatus` header badge — shows "X left" or "Premium" badge in top-right of chat header
  - Free: pill showing `{freeTrials} left` with warning color when ≤ 2
  - Premium: crown icon badge
- [ ] **Upgrade Dialog** — replace current inline error text with a proper modal:
  - Free plan: `7 messages / day`
  - Premium: `Unlimited`
  - "Upgrade Now" button → routes to subscription screen
  - "Cancel" button
- [ ] **Conversation Limit Dialog** — modal when max messages reached:
  - Message explaining limit
  - "Start New Chat" button
  - "Cancel" button
- [ ] Block suggestion chip taps when `freeTrials <= 0` → show upgrade dialog

---

### P4 — ChatInput Missing Features

- [ ] **Voice input (STT)** — mic button is currently decorative; wire up actual speech-to-text:
  - Use `expo-speech-recognition` or call Sarvam STT API (same as web `useSarvamSTT`)
  - Mic button: idle → tap to start recording → tap again to stop
  - On stop: transcribe → set input → auto-submit
  - Show recording state: animate button + show "Recording..." / "Transcribing..." text
  - Show `Persona`-equivalent visual animation while recording/processing
- [ ] **Bill scan / OCR** (Premium only):
  - Camera button (lock icon overlay for free users → tap shows upgrade prompt)
  - On tap: launch image picker / camera
  - Upload image to ImageKit via `/api/imagekit-auth`
  - On upload success: directly `sendMessage` with `file` part + "Scan this bill" text
  - Show upload progress state ("Uploading...")
  - 10 MB file size cap with error toast
- [ ] **`selectedTransaction` attachment chip**:
  - When edit/delete swipe action is triggered in `MessageList`, instead of directly calling `sendMessage`, set a `selectedTransaction` state in `chat.tsx`
  - Render a `TransactionAttachment` strip above the `ChatInput` showing the selected transaction with a remove (×) button
  - For delete action: show "Send to confirm…" placeholder; send immediately on tap
  - For edit action: wait for user to type the change instruction, then build prefix + user text
  - "Clear" button on chip clears `selectedTransaction`

---

### P5 — MessageList Missing Features

- [ ] **`reasoning` parts** — render a collapsible "Thinking..." disclosure for parts with `type === "reasoning"`:
  - While streaming (`state === "streaming"`): show spinner + "Thinking..."
  - When done (`state === "done"`): show collapsible with reasoning text
- [ ] **`file` parts (image)** — when a message part has `type === "file"` and `mediaType` starts with `image/`, render the image in the bubble using `<Image>` (expo-image)
- [ ] **`tool-saveIncome` error state** — handle `state === "output-error"` and show an error message in the bubble

---

### Services (`src/services/conversations.ts`)

- [ ] `GET /api/conversations`
- [ ] `GET /api/conversations/:id`
- [ ] `POST /api/conversations`
- [ ] `PUT /api/conversations/:id`
- [ ] `DELETE /api/conversations/:id`

---

## Phase 7 — Settings & Profile

**Screen (`src/app/(tabs)/settings.tsx`)**

- [ ] Profile info card: name, email (display)
- [ ] Change password section (current + new password form)
- [ ] Plan & Usage card: free/premium badge, free trials remaining, subscription dates
- [ ] Active Sessions card: list devices/sessions, revoke individual sessions
- [ ] Theme toggle: Light / Dark / System
- [ ] Report an Issue / Feedback bug reporting feature (similar to web)
- [ ] Danger Zone: delete account (confirmation dialog + cascade delete)
- [ ] Sign out button

**Subscription Screen (`src/app/subscription.tsx`)**

- [ ] Premium plan details
- [ ] Razorpay payment (react-native Razorpay SDK or WebView fallback)
- [ ] Cancel subscription button (for active subscribers)

**Services (`src/services/profile.ts`, `src/services/sessions.ts`)**

- [ ] `GET /api/auth/get-session`
- [ ] `POST /api/auth/change-password`
- [ ] `GET /api/auth/list-sessions`
- [ ] `POST /api/auth/revoke-session`
- [ ] `DELETE /api/auth/delete-user` — account deletion
- [ ] `GET/POST /api/razorpay` — subscription payment

---

## Phase 8 — UI Component Library

Custom mobile components (shadcn-inspired, using Uniwind):

- [ ] `Button` — variants: default, outline, ghost, destructive; sizes: sm, md, lg
- [ ] `Input` — text input with label, error state, helper text
- [ ] `Card` — container with padding and border radius
- [ ] `Badge` — category/status pill
- [ ] `ProgressBar` — for budgets
- [ ] `Skeleton` — loading placeholders
- [ ] `BottomSheet` — reusable bottom sheet wrapper
- [ ] `Avatar` — initials-based avatar with fallback
- [ ] `Separator` — horizontal divider
- [ ] `Toast / Snackbar` — success/error notifications

---

## Phase 9 — Future / Backlog (from Web TODO)

- [ ] Receipt / Bill OCR Upload — camera capture → GPT-4o Vision extracts amount, category, merchant, date → pre-fills Add Transaction form
- [ ] Voice Agent — mic button on Home/Chat → speech-to-text → AI parses and creates expense
- [ ] AI Monthly Summary — streaming AI insight on Reports screen
- [ ] Multi-Currency Support — store currency per transaction, convert to base for totals
- [ ] Export CSV — transactions export (currently disabled on web too)

---

## Backend (Expo API Routes — `src/app/api/`)

These proxy/extend the web's existing Next.js API. For features not feasibly proxied, implement directly:

- [x] `chat+api.ts` — AI streaming chat (already implemented)
- [ ] All other routes will call the deployed web backend (`EXPO_PUBLIC_API_URL` env var) via the Axios instance — no separate backend needed for MVP

---

## Notes

- Web backend base URL stored in `.env.local` as `EXPO_PUBLIC_API_URL`
- Auth sessions from better-auth — token stored in MMKV, sent via `Authorization: Bearer <token>` header
- All API calls mirror the web's Next.js API routes (`/api/transactions`, `/api/budgets`, etc.)
- Categories and expense types kept in sync with web via shared constants
- Theme: dark mode first, system-aware via `useColorScheme`
