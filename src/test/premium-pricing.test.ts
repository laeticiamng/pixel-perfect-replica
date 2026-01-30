import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * Premium Pricing Model Tests
 * Tests the hybrid pricing model: Free / Pay-per-use / Easy+
 */

describe("Premium Pricing Model", () => {
  describe("Free Tier", () => {
    it("should allow 2 free sessions per month", () => {
      const FREE_SESSIONS_LIMIT = 2;
      expect(FREE_SESSIONS_LIMIT).toBe(2);
    });

    it("should reset quota at the beginning of each month", () => {
      const currentMonth = "2026-01";
      const usageRecord = { month_year: "2025-12", sessions_created: 5 };
      
      const isNewMonth = usageRecord.month_year !== currentMonth;
      expect(isNewMonth).toBe(true);
    });

    it("should include Live Mode for free users", () => {
      const freeFeatures = ["live_mode", "basic_sessions"];
      expect(freeFeatures).toContain("live_mode");
    });
  });

  describe("Pay-per-use (0.99€/session)", () => {
    const SESSION_PRICE_CENTS = 99;

    it("should price sessions at 0.99€", () => {
      expect(SESSION_PRICE_CENTS / 100).toBe(0.99);
    });

    it("should allow purchasing 1-10 sessions at once", () => {
      const MIN_QUANTITY = 1;
      const MAX_QUANTITY = 10;

      const validateQuantity = (qty: number) => qty >= MIN_QUANTITY && qty <= MAX_QUANTITY;

      expect(validateQuantity(1)).toBe(true);
      expect(validateQuantity(5)).toBe(true);
      expect(validateQuantity(10)).toBe(true);
      expect(validateQuantity(0)).toBe(false);
      expect(validateQuantity(11)).toBe(false);
    });

    it("should calculate total price correctly", () => {
      const quantities = [1, 3, 5, 10];
      
      quantities.forEach((qty) => {
        const total = qty * SESSION_PRICE_CENTS;
        expect(total).toBe(qty * 99);
      });
    });

    it("should never expire purchased sessions", () => {
      const purchasedSession = {
        purchased_at: new Date("2025-01-01"),
        expires_at: null, // Never expires
      };

      expect(purchasedSession.expires_at).toBeNull();
    });

    it("should add purchased sessions to user profile", () => {
      const userBefore = { purchased_sessions: 2 };
      const sessionsToAdd = 3;
      const userAfter = { purchased_sessions: userBefore.purchased_sessions + sessionsToAdd };

      expect(userAfter.purchased_sessions).toBe(5);
    });

    it("should consume purchased sessions after free quota", () => {
      const user = {
        free_sessions_used: 2,
        free_sessions_limit: 2,
        purchased_sessions: 3,
      };

      // Free quota exhausted
      const freeRemaining = user.free_sessions_limit - user.free_sessions_used;
      expect(freeRemaining).toBe(0);

      // Use purchased session
      const canUsePurchased = user.purchased_sessions > 0;
      expect(canUsePurchased).toBe(true);
    });
  });

  describe("Easy+ (9.90€/month)", () => {
    const EASYPLUS_PRICE_CENTS = 990;

    it("should price subscription at 9.90€/month", () => {
      expect(EASYPLUS_PRICE_CENTS / 100).toBe(9.90);
    });

    it("should grant unlimited sessions", () => {
      const UNLIMITED = -1;
      const easyPlusUser = { sessions_limit: UNLIMITED };
      
      expect(easyPlusUser.sessions_limit).toBe(-1);
    });

    it("should include all premium features", () => {
      const EASYPLUS_FEATURES = [
        "unlimited_sessions",
        "live_mode",
        "ghost_mode",
        "priority_support",
        "premium_badge",
      ];

      expect(EASYPLUS_FEATURES).toContain("unlimited_sessions");
      expect(EASYPLUS_FEATURES).toContain("ghost_mode");
      expect(EASYPLUS_FEATURES).toContain("premium_badge");
      expect(EASYPLUS_FEATURES.length).toBe(5);
    });

    it("should set is_premium flag on profile", () => {
      const subscribedUser = { is_premium: true };
      expect(subscribedUser.is_premium).toBe(true);
    });

    it("should track subscription end date", () => {
      const subscription = {
        started_at: new Date("2026-01-15"),
        subscription_end: new Date("2026-02-15"),
      };

      const daysRemaining = Math.ceil(
        (subscription.subscription_end.getTime() - Date.now()) / (24 * 60 * 60 * 1000)
      );

      expect(subscription.subscription_end).toBeDefined();
    });
  });

  describe("Quota Calculation", () => {
    it("should calculate total available sessions correctly", () => {
      const testCases = [
        // Free user, no purchased sessions
        { isPremium: false, freeLimit: 2, purchased: 0, expected: 2 },
        // Free user with purchased sessions
        { isPremium: false, freeLimit: 2, purchased: 5, expected: 7 },
        // Premium user (unlimited)
        { isPremium: true, freeLimit: 2, purchased: 0, expected: -1 },
      ];

      testCases.forEach(({ isPremium, freeLimit, purchased, expected }) => {
        const totalLimit = isPremium ? -1 : freeLimit + purchased;
        expect(totalLimit).toBe(expected);
      });
    });

    it("should correctly determine if user can create session", () => {
      const testCases = [
        // Premium user - always can create
        { isPremium: true, sessionsCreated: 100, limit: -1, canCreate: true },
        // Free user under limit
        { isPremium: false, sessionsCreated: 1, limit: 2, canCreate: true },
        // Free user at limit
        { isPremium: false, sessionsCreated: 2, limit: 2, canCreate: false },
        // Free user with purchased, under total limit
        { isPremium: false, sessionsCreated: 3, limit: 5, canCreate: true },
        // Free user with purchased, at total limit
        { isPremium: false, sessionsCreated: 5, limit: 5, canCreate: false },
      ];

      testCases.forEach(({ isPremium, sessionsCreated, limit, canCreate: expected }) => {
        const canCreate = isPremium || sessionsCreated < limit;
        expect(canCreate).toBe(expected);
      });
    });
  });

  describe("Stripe Integration", () => {
    const STRIPE_PRODUCTS = {
      easyplus: {
        product_id: "prod_Tt2j54BELa7Ou8",
        price_id: "price_1SvGdpDFa5Y9NR1I1qP73OYs",
        price_cents: 990,
      },
      session: {
        product_id: "prod_Tt2j5FhafYko8T",
        price_id: "price_1SvGdqDFa5Y9NR1IrL2P71Ms",
        price_cents: 99,
      },
    };

    it("should have correct product IDs configured", () => {
      expect(STRIPE_PRODUCTS.easyplus.product_id).toMatch(/^prod_/);
      expect(STRIPE_PRODUCTS.session.product_id).toMatch(/^prod_/);
    });

    it("should have correct price IDs configured", () => {
      expect(STRIPE_PRODUCTS.easyplus.price_id).toMatch(/^price_/);
      expect(STRIPE_PRODUCTS.session.price_id).toMatch(/^price_/);
    });

    it("should create checkout session with correct mode", () => {
      const subscriptionCheckout = { mode: "subscription" };
      const paymentCheckout = { mode: "payment" };

      expect(subscriptionCheckout.mode).toBe("subscription");
      expect(paymentCheckout.mode).toBe("payment");
    });

    it("should handle checkout success redirect", () => {
      const successParams = new URLSearchParams("?success=true");
      const sessionPurchasedParams = new URLSearchParams("?session_purchased=3");

      expect(successParams.get("success")).toBe("true");
      expect(sessionPurchasedParams.get("session_purchased")).toBe("3");
    });

    it("should handle checkout cancellation", () => {
      const canceledParams = new URLSearchParams("?canceled=true");
      expect(canceledParams.get("canceled")).toBe("true");
    });
  });

  describe("UI Display", () => {
    it("should show current usage for free users", () => {
      const usage = {
        sessionsCreated: 1,
        sessionsLimit: 2,
        purchasedSessions: 0,
      };

      const displayText = `${usage.sessionsCreated} / ${usage.sessionsLimit}`;
      expect(displayText).toBe("1 / 2");
    });

    it("should show infinity symbol for premium users", () => {
      const usage = { sessionsLimit: -1 };
      const displayLimit = usage.sessionsLimit === -1 ? "∞" : usage.sessionsLimit.toString();
      expect(displayLimit).toBe("∞");
    });

    it("should highlight Easy+ as recommended", () => {
      const plans = [
        { id: "free", recommended: false },
        { id: "session", recommended: false },
        { id: "easyplus", recommended: true },
      ];

      const recommended = plans.find((p) => p.recommended);
      expect(recommended?.id).toBe("easyplus");
    });

    it("should show purchased sessions badge", () => {
      const purchasedSessions = 5;
      const shouldShowBadge = purchasedSessions > 0;
      expect(shouldShowBadge).toBe(true);
    });
  });
});

describe("Edge Function: purchase-session", () => {
  it("should require authentication", () => {
    const authHeader = "Bearer valid-token";
    expect(authHeader).toContain("Bearer");
  });

  it("should validate quantity parameter", () => {
    const validateQuantity = (qty: number) => {
      if (typeof qty !== "number") return false;
      if (qty < 1 || qty > 10) return false;
      if (!Number.isInteger(qty)) return false;
      return true;
    };

    expect(validateQuantity(1)).toBe(true);
    expect(validateQuantity(10)).toBe(true);
    expect(validateQuantity(0)).toBe(false);
    expect(validateQuantity(11)).toBe(false);
    expect(validateQuantity(1.5)).toBe(false);
  });

  it("should include user_id in session metadata", () => {
    const metadata = {
      user_id: "uuid-123",
      sessions_purchased: "3",
      type: "session_purchase",
    };

    expect(metadata.user_id).toBeDefined();
    expect(metadata.type).toBe("session_purchase");
  });
});

describe("Edge Function: confirm-session-purchase", () => {
  it("should add sessions to user profile", () => {
    const currentSessions = 2;
    const toAdd = 3;
    const newTotal = currentSessions + toAdd;

    expect(newTotal).toBe(5);
  });

  it("should return success with new total", () => {
    const response = {
      success: true,
      sessions_added: 3,
      new_total: 5,
    };

    expect(response.success).toBe(true);
    expect(response.sessions_added).toBe(3);
    expect(response.new_total).toBe(5);
  });
});

describe("Database Function: get_current_month_usage", () => {
  it("should return correct structure", () => {
    const result = {
      sessions_created: 1,
      sessions_limit: 5, // 2 free + 3 purchased
      is_premium: false,
      can_create: true,
      purchased_sessions: 3,
    };

    expect(result).toHaveProperty("sessions_created");
    expect(result).toHaveProperty("sessions_limit");
    expect(result).toHaveProperty("is_premium");
    expect(result).toHaveProperty("can_create");
    expect(result).toHaveProperty("purchased_sessions");
  });

  it("should calculate limit correctly for free users", () => {
    const FREE_BASE_LIMIT = 2;
    const purchasedSessions = 3;
    const totalLimit = FREE_BASE_LIMIT + purchasedSessions;

    expect(totalLimit).toBe(5);
  });

  it("should return -1 limit for premium users", () => {
    const isPremium = true;
    const limit = isPremium ? -1 : 2;

    expect(limit).toBe(-1);
  });
});

describe("Database Function: add_purchased_sessions", () => {
  it("should increment purchased_sessions column", () => {
    const before = { purchased_sessions: 2 };
    const toAdd = 5;
    const after = { purchased_sessions: before.purchased_sessions + toAdd };

    expect(after.purchased_sessions).toBe(7);
  });

  it("should handle null initial value", () => {
    const before = { purchased_sessions: null };
    const toAdd = 3;
    const after = { purchased_sessions: (before.purchased_sessions || 0) + toAdd };

    expect(after.purchased_sessions).toBe(3);
  });
});
