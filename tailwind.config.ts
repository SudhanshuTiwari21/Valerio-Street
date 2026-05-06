import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1.25rem",
        sm: "1.5rem",
        lg: "2.5rem",
        xl: "4rem",
        "2xl": "6rem",
      },
      screens: {
        "2xl": "1480px",
      },
    },
    extend: {
      colors: {
        bone: "#F5F1EA",
        sand: "#D8CBB8",
        charcoal: "#1A1A1A",
        olive: "#5E6B57",
        gold: "#B89B72",
        ink: "#111111",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Cormorant Garamond", "Garamond", "serif"],
        sans: ["var(--font-sans)", "Inter", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        editorial: "0.18em",
        wider: "0.12em",
        widest: "0.24em",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        soft: "0 1px 0 0 rgba(17,17,17,0.04), 0 8px 30px -12px rgba(17,17,17,0.08)",
        editorial: "0 30px 80px -40px rgba(17,17,17,0.25)",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "marquee": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "ken-burns": {
          "0%": { transform: "scale(1) translate(0,0)" },
          "100%": { transform: "scale(1.08) translate(-1.5%, -1.5%)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.8s ease-out forwards",
        marquee: "marquee 40s linear infinite",
        "ken-burns": "ken-burns 14s ease-out forwards",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
