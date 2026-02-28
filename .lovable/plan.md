

## Fix: `check-subscription` infinite polling loop

### Problem

The `useSubscription` hook has a **circular dependency** that causes `check-subscription` to be called in an infinite loop:

1. `checkSubscription` is a `useCallback` that depends on `[user, refreshProfile]`
2. `checkSubscription` calls `refreshProfile()` at the end, which updates `profile` in `AuthContext`
3. When `AuthContext` state changes, `refreshProfile` reference may change, causing `checkSubscription` to be recreated
4. The `useEffect` on line 126-128 watches `[checkSubscription]` and re-fires every time it's recreated
5. This creates an infinite loop: check -> refreshProfile -> callback recreated -> effect fires -> check -> ...

### Solution

**File: `src/hooks/useSubscription.ts`**

1. Remove `refreshProfile` from the `useCallback` dependency array of `checkSubscription` by using a ref to hold `refreshProfile`, breaking the circular dependency
2. Use a `useRef` for `refreshProfile` so the callback identity stays stable
3. This ensures the `useEffect` on mount runs only once, and the 60s interval works as intended

```text
Before:  checkSubscription -> refreshProfile -> state change -> callback recreated -> effect re-fires -> loop
After:   checkSubscription (stable) -> refreshProfile (via ref) -> state change -> no callback recreation -> no loop
```

### Changes

- **`src/hooks/useSubscription.ts`**: Add a `useRef` for `refreshProfile`, update `useCallback` deps to `[user]` only. The ref will always point to the latest `refreshProfile` without causing the callback to be recreated.

