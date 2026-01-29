import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
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
    
    const { getByText, getByPlaceholderText } = render(
      <MemoryRouter>
        <OnboardingPage />
      </MemoryRouter>
    );

    expect(getByText("Créons ton compte")).toBeInTheDocument();
    expect(getByPlaceholderText("ton.email@universite.fr")).toBeInTheDocument();
    expect(getByPlaceholderText("Mot de passe")).toBeInTheDocument();
  });

  it("should show login form when isLogin state is true", async () => {
    const { default: OnboardingPage } = await import("@/pages/OnboardingPage");
    
    const { getByText } = render(
      <MemoryRouter initialEntries={[{ pathname: "/onboarding", state: { isLogin: true } }]}>
        <OnboardingPage />
      </MemoryRouter>
    );

    expect(getByText("Content de te revoir !")).toBeInTheDocument();
    expect(getByText("Mot de passe oublié ?")).toBeInTheDocument();
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
    
    const { getByPlaceholderText } = render(
      <MemoryRouter>
        <OnboardingPage />
      </MemoryRouter>
    );

    expect(getByPlaceholderText("Prénom")).toBeInTheDocument();
    expect(getByPlaceholderText("Université (optionnel)")).toBeInTheDocument();
  });
});
