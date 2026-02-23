# MMKV v4 — Quick Reference

> Uses `createMMKV()` (not `new MMKV()`). Requires `react-native-mmkv` + `react-native-nitro-modules`.

## Create Instance

```ts
import { createMMKV } from "react-native-mmkv";

export const storage = createMMKV({ id: "aixpense" });

export const userStorage = createMMKV({
  id: `user-${userId}-storage`,
  encryptionKey: "secret",
});
```

## Read / Write

```ts
storage.set("key", "value");
storage.set("count", 42);
storage.set("flag", true);

storage.getString("key");
storage.getNumber("count");
storage.getBoolean("flag");
```

## Keys

```ts
storage.contains("key");
storage.remove("key");
storage.getAllKeys();
storage.clearAll();
```

## Objects

```ts
storage.set("user", JSON.stringify({ name: "Marc" }));
const user = JSON.parse(storage.getString("user") ?? "{}");
```

## Hooks

```ts
import {
  useMMKVString,
  useMMKVNumber,
  useMMKVBoolean,
} from "react-native-mmkv";

const [token, setToken] = useMMKVString("auth_token");
const [count, setCount] = useMMKVNumber("count");
const [flag, setFlag] = useMMKVBoolean("flag");
```

## Encryption

```ts
storage.encrypt("secret");
storage.decrypt();
```

## Check / Delete Instance

```ts
import { existsMMKV, deleteMMKV } from "react-native-mmkv";

existsMMKV("my-instance");
deleteMMKV("my-instance");
```

## Notes

- All calls are **synchronous** — no async/await
- `remove()` is the v4 method (v3 used `delete()`)
- `createMMKV()` is the v4 constructor (v3 used `new MMKV()`)
- Requires New Architecture / TurboModules enabled
