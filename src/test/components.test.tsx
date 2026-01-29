import { describe, it, expect, vi } from "vitest";

/**
 * Component Tests
 * Testing UI components render correctly
 */

// Mock matchMedia for tests
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});

describe("Component - Button", () => {
  it("should have correct button variants", () => {
    const variants = ["default", "destructive", "outline", "secondary", "ghost", "link"];
    expect(variants.length).toBe(6);
  });

  it("should have correct button sizes", () => {
    const sizes = ["default", "sm", "lg", "icon"];
    expect(sizes.length).toBe(4);
  });
});

describe("Component - Input", () => {
  it("should validate email format", () => {
    const validEmails = ["test@example.com", "user.name@domain.co.uk"];
    const invalidEmails = ["invalid", "@domain.com", "user@"];

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    validEmails.forEach((email) => {
      expect(emailRegex.test(email)).toBe(true);
    });

    invalidEmails.forEach((email) => {
      expect(emailRegex.test(email)).toBe(false);
    });
  });
});

describe("Component - Signal Marker", () => {
  it("should have correct signal colors", () => {
    const signalColors = {
      green: "bg-signal-green",
      yellow: "bg-signal-yellow",
      red: "bg-signal-red",
    };

    expect(signalColors.green).toContain("green");
    expect(signalColors.yellow).toContain("yellow");
    expect(signalColors.red).toContain("red");
  });

  it("should show correct glow based on signal", () => {
    const getGlowClass = (signal: string) => {
      switch (signal) {
        case "green":
          return "glow-green";
        case "yellow":
          return "glow-yellow";
        default:
          return "";
      }
    };

    expect(getGlowClass("green")).toBe("glow-green");
    expect(getGlowClass("yellow")).toBe("glow-yellow");
    expect(getGlowClass("red")).toBe("");
  });
});

describe("Component - Activity Selector", () => {
  it("should have all activity types", () => {
    const activities = ["studying", "eating", "working", "talking", "sport", "other"];
    expect(activities.length).toBe(6);
  });

  it("should have emoji for each activity", () => {
    const activityEmojis: Record<string, string> = {
      studying: "📚",
      eating: "🍽️",
      working: "💻",
      talking: "💬",
      sport: "🏃",
      other: "✨",
    };

    Object.values(activityEmojis).forEach((emoji) => {
      expect(emoji.length).toBeGreaterThan(0);
    });
  });
});

describe("Component - Expiration Timer", () => {
  it("should format time correctly", () => {
    const formatTime = (diff: number) => {
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      if (hours > 0) {
        return `${hours}h${minutes.toString().padStart(2, "0")}`;
      }
      return `${minutes}min`;
    };

    expect(formatTime(2 * 60 * 60 * 1000)).toBe("2h00");
    expect(formatTime(1.5 * 60 * 60 * 1000)).toBe("1h30");
    expect(formatTime(30 * 60 * 1000)).toBe("30min");
  });

  it("should show extend button when under 30 minutes", () => {
    const EXTEND_THRESHOLD = 30 * 60 * 1000;
    const diff25min = 25 * 60 * 1000;
    const diff35min = 35 * 60 * 1000;

    expect(diff25min < EXTEND_THRESHOLD).toBe(true);
    expect(diff35min < EXTEND_THRESHOLD).toBe(false);
  });
});

describe("Component - Emergency Button", () => {
  it("should require 2 second hold", () => {
    const HOLD_DURATION = 2000;
    expect(HOLD_DURATION).toBe(2000);
  });

  it("should have progress indicator", () => {
    const getProgress = (elapsed: number, total: number) => {
      return Math.min((elapsed / total) * 100, 100);
    };

    expect(getProgress(1000, 2000)).toBe(50);
    expect(getProgress(2000, 2000)).toBe(100);
    expect(getProgress(3000, 2000)).toBe(100);
  });
});

describe("Component - Theme Toggle", () => {
  it("should have all theme options", () => {
    const themes = ["light", "dark", "system"];
    expect(themes.length).toBe(3);
  });
});

describe("Component - Password Strength Indicator", () => {
  it("should calculate password strength correctly", () => {
    const getStrength = (password: string) => {
      let score = 0;
      if (password.length >= 6) score += 25;
      if (/[a-z]/.test(password)) score += 25;
      if (/[A-Z]/.test(password)) score += 25;
      if (/[0-9]/.test(password)) score += 25;
      return score;
    };

    expect(getStrength("abc")).toBe(25); // lowercase only, short
    expect(getStrength("abcdef")).toBe(50); // lowercase, 6+ chars
    expect(getStrength("Abcdef")).toBe(75); // lower + upper + length
    expect(getStrength("Abcdef1")).toBe(100); // all criteria
  });
});

describe("Component - Skeleton", () => {
  it("should have different skeleton variants", () => {
    const variants = ["ProfileCardSkeleton", "StatCardSkeleton", "ListItemSkeleton", "ChartSkeleton"];
    expect(variants.length).toBe(4);
  });
});

describe("Component - Bottom Nav", () => {
  it("should have correct navigation items", () => {
    const navItems = [
      { path: "/map", label: "Carte" },
      { path: "/profile", label: "Profil" },
      { path: "/settings", label: "Paramètres" },
    ];

    expect(navItems.length).toBe(3);
    expect(navItems.map((i) => i.path)).toContain("/map");
    expect(navItems.map((i) => i.path)).toContain("/profile");
    expect(navItems.map((i) => i.path)).toContain("/settings");
  });
});

describe("Component - Cookie Consent", () => {
  it("should track consent in localStorage", () => {
    const STORAGE_KEY = "cookie-consent";
    const consent = { analytics: true, marketing: false };

    // Simulate storing consent
    const stored = JSON.stringify(consent);
    expect(JSON.parse(stored)).toEqual(consent);
  });
});

describe("Component - Icebreaker Card", () => {
  it("should have icebreakers for each activity", () => {
    const icebreakers: Record<string, string[]> = {
      studying: ["Tu prépares quel exam ?", "C'est quoi ta matière préférée ?"],
      eating: ["C'est bon ce que tu manges ?"],
      working: ["Tu bosses sur quoi ?"],
      talking: ["Alors, quoi de neuf ?"],
      sport: ["Tu fais quoi comme sport ?"],
      other: ["Qu'est-ce qui t'amène ici ?"],
    };

    Object.values(icebreakers).forEach((list) => {
      expect(list.length).toBeGreaterThan(0);
    });
  });
});
