# Aixpense Mobile - Development Plan & Setup

## Current Stack

- **Framework:** Expo (React Native v0.81) & Expo Router
- **Styling:** Tailwind CSS v4 + Uniwind
- **Package Manager:** Bun

## Proposed Dependencies (Refined)

**Core / API state:**

- `@tanstack/react-query`: Server state and API caching (v5).
- `axios`: Custom API client with interceptors for auth headers.

**UI / Components:**

- **Custom UI:** You will build your own reusable UI components (shadcn-inspired logic, but custom implementations using `uniwind`).
- **Icons:** `@expo/vector-icons` (Already included with Expo. No web support needed).
- **Utility:** `clsx` and `tailwind-merge` (Highly recommended for building custom UI components. It helps dynamically merge Tailwind classes).

**Storage / Cache:**

- `react-native-mmkv` (v4) + `react-native-nitro-modules`: For blazing fast local storage.

**Forms & Validation:**

- `react-hook-form`: To handle mobile forms efficiently.
- `zod` & `@hookform/resolvers`: For schema validation (keeping it consistent with the web).

**Date Management:**

- `date-fns` or `dayjs`: For formatting expense dates (up to you).

## Tasks To Do

- [x] 1. Review and approve the refined dependency list above.
- [x] 2. Install approved dependencies using `bun add`.
- [x] 3. Setup core providers (`ThemeProvider`, `QueryClientProvider`).
- [ ] 4. Configure the API client structure (with intercepts for auth).
- [ ] 5. Create the base UI component library (shadcn equivalents for mobile: Button, Input, Card).
- [x] 6. Finalize solid folder structure for Expo Router and src path.
- [ ] 7. Build the initial screens (Auth/Login, Dashboard layout).
