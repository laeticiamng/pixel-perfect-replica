import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        sm: "1.5rem",
        lg: "2rem",
      },
      screens: {
        sm: "100%",
        md: "540px",
        lg: "540px",
        xl: "540px",
        "2xl": "540px",
      },
    },
    extend: {
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
        mono: ['Space Mono', 'monospace'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        violet: {
          DEFAULT: "hsl(var(--violet))",
          light: "hsl(var(--violet-light))",
          dark: "hsl(var(--violet-dark))",
          glow: "hsl(var(--violet-glow))",
        },
        coral: {
          DEFAULT: "hsl(var(--coral))",
          light: "hsl(var(--coral-light))",
          dark: "hsl(var(--coral-dark))",
          glow: "hsl(var(--coral-glow))",
        },
        purple: {
          accent: "hsl(var(--purple-accent))",
          glow: "hsl(var(--purple-glow))",
        },
        'deep-blue': {
          DEFAULT: "hsl(var(--deep-blue))",
          light: "hsl(var(--deep-blue-light))",
        },
        midnight: "hsl(var(--midnight))",
        signal: {
          green: "hsl(var(--signal-green))",
          orange: "hsl(var(--signal-orange))",
          yellow: "hsl(var(--signal-yellow))",
          gray: "hsl(var(--signal-gray))",
          red: "hsl(var(--signal-red))",
        },
        gray: {
          100: "hsl(var(--gray-100))",
          200: "hsl(var(--gray-200))",
          300: "hsl(var(--gray-300))",
          400: "hsl(var(--gray-400))",
          500: "hsl(var(--gray-500))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 4px)",
        sm: "calc(var(--radius) - 8px)",
        xl: "calc(var(--radius) + 8px)",
        "2xl": "calc(var(--radius) + 16px)",
      },
      boxShadow: {
        'glow-coral': 'var(--glow-coral)',
        'glow-violet': 'var(--glow-violet)',
        'glow-green': 'var(--glow-green)',
        'glow-orange': 'var(--glow-orange)',
        'glow-yellow': 'var(--glow-yellow)',
        'glow-red': 'var(--glow-red)',
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "pulse-subtle": {
          "0%, 100%": { boxShadow: "0 0 20px 0 hsl(var(--coral) / 0.3)" },
          "50%": { boxShadow: "0 0 30px 8px hsl(var(--coral) / 0.5)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse-subtle": "pulse-subtle 2.5s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
