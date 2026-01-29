import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LandingPage from '@/pages/LandingPage';

// Mock useAuth
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    isAuthenticated: false,
    isLoading: false,
    user: null,
    profile: null,
  }),
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('LandingPage', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('should render the main title', () => {
    const { getByText } = render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );
    
    expect(getByText('SIGNAL')).toBeInTheDocument();
  });

  it('should render the tagline', () => {
    const { getByText } = render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );
    
    // Updated tagline - use more specific selector for the main tagline paragraph
    const tagline = getByText(/Vois qui est ouvert/);
    expect(tagline).toBeInTheDocument();
  });

  it('should render the CTA buttons', () => {
    const { getByText } = render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );
    
    expect(getByText('Commencer')).toBeInTheDocument();
    expect(getByText("J'ai déjà un compte")).toBeInTheDocument();
  });

  it('should render 3 feature cards', () => {
    const { getByText } = render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );
    
    expect(getByText('Signale que tu es ouvert')).toBeInTheDocument();
    expect(getByText('Vois les signaux autour')).toBeInTheDocument();
    expect(getByText('Approche sans awkwardness')).toBeInTheDocument();
  });

  it('should render footer with terms link', () => {
    const { getByText } = render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );
    
    expect(getByText(/conditions d'utilisation/)).toBeInTheDocument();
  });
});
