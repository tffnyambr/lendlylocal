

## Add Dark/Light Mode Toggle to Profile Settings

### What will change
A toggle switch will appear in the Settings row of your Profile menu, letting you switch between light and dark mode. Your preference will be remembered across sessions.

### Technical Details

**1. Add ThemeProvider to the app (`src/App.tsx`)**
- Wrap the app with `ThemeProvider` from `next-themes` (already installed) with `attribute="class"`, `defaultTheme="light"`, and `storageKey="lendly-theme"` so the preference persists in localStorage.

**2. Update `src/tabs/ProfileTab.tsx`**
- Import `useTheme` from `next-themes` and the `Switch` component.
- Replace the static "Settings" menu item with an inline row that has a `Sun`/`Moon` icon, a "Dark Mode" label, and a `Switch` toggle on the right side (instead of the chevron).
- The switch calls `setTheme()` to toggle between `"light"` and `"dark"`.

**3. Update `tailwind.config.ts`**
- Set `darkMode: "class"` so Tailwind applies dark styles based on the `class` attribute on `<html>`, which `next-themes` manages automatically.

### Summary of files to edit
- `tailwind.config.ts` -- add `darkMode: "class"`
- `src/App.tsx` -- wrap with `ThemeProvider`
- `src/tabs/ProfileTab.tsx` -- add dark mode toggle in the menu

