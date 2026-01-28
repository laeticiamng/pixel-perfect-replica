import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

// Mock the auth context
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    signIn: vi.fn(),
    signUp: vi.fn(),
    isAuthenticated: false,
  }),
}));

// Mock the location store
vi.mock("@/stores/locationStore", () => ({
  useLocationStore: () => ({
    startWatching: vi.fn(),
    position: null,
  }),
}));

describe("OnboardingPage", () => {
  it("should render signup form by default", async () => {
    const { default: OnboardingPage } = await import("@/pages/OnboardingPage");
    
    render(
      <MemoryRouter>
        <OnboardingPage />
      </MemoryRouter>
    );

    expect(screen.getByText("Créons ton compte")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("ton.email@universite.fr")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Mot de passe")).toBeInTheDocument();
  });

  it("should show login form when isLogin state is true", async () => {
    const { default: OnboardingPage } = await import("@/pages/OnboardingPage");
    
    render(
      <MemoryRouter initialEntries={[{ pathname: "/onboarding", state: { isLogin: true } }]}>
        <OnboardingPage />
      </MemoryRouter>
    );

    expect(screen.getByText("Content de te revoir !")).toBeInTheDocument();
    expect(screen.getByText("Mot de passe oublié ?")).toBeInTheDocument();
  });

  it("should have 3 progress dots", async () => {
    const { default: OnboardingPage } = await import("@/pages/OnboardingPage");
    
    render(
      <MemoryRouter>
        <OnboardingPage />
      </MemoryRouter>
    );

    // Check for progress indicators (3 dots)
    const progressDots = document.querySelectorAll('.rounded-full.transition-all');
    expect(progressDots.length).toBe(3);
  });

  it("should show firstName field on signup", async () => {
    const { default: OnboardingPage } = await import("@/pages/OnboardingPage");
    
    render(
      <MemoryRouter>
        <OnboardingPage />
      </MemoryRouter>
    );

    expect(screen.getByPlaceholderText("Prénom")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Université (optionnel)")).toBeInTheDocument();
  });
});
