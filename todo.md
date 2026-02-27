# Aixpense Mobile - Development Plan

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

**Services (`src/services/reports.ts`)**

- [ ] `GET /api/reports?type=overview&range=&mode=`
- [ ] `GET /api/reports?type=trend&range=&mode=`
- [ ] `GET /api/reports?type=categories&range=&mode=`
- [ ] `GET /api/reports?type=budget-vs-actual&range=`
- [ ] `GET /api/reports?type=top-expenses&range=&mode=`

---

## Phase 6 — AI Chat (AiXpense)

**Screen (`src/app/(tabs)/chat.tsx`)**

- [ ] Conversation list sidebar / bottom sheet to switch between past chats
- [ ] Chat view with message bubbles (user / assistant)
- [ ] Streaming responses via Expo API route (`src/app/api/chat+api.ts` — already exists)
- [ ] New chat button
- [ ] Free trial counter display (X of 5 messages used)
- [ ] Upgrade prompt modal when trials exhausted (routes to Subscription screen)
- [ ] Conversation message limit dialog (max messages per conversation)
- [ ] Onboarding modal for first-time users who haven't completed onboarding

**Services (`src/services/conversations.ts`)**

- [ ] `GET /api/conversations` — list all conversations
- [ ] `GET /api/conversations/:id` — load messages for a conversation
- [ ] Uses `useChat` from `@ai-sdk/react` for streaming + message management

---

## Phase 7 — Settings & Profile

**Screen (`src/app/(tabs)/settings.tsx`)**

- [ ] Profile info card: name, email (display)
- [ ] Change password section (current + new password form)
- [ ] Plan & Usage card: free/premium badge, free trials remaining, subscription dates
- [ ] Active Sessions card: list devices/sessions, revoke individual sessions
- [ ] Theme toggle: Light / Dark / System
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
