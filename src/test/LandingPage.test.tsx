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
    
    // Updated tagline with explicit description
    const tagline = getByText(/qui est ouvert/);
    expect(tagline).toBeInTheDocument();
  });

  it('should render the CTA buttons', () => {
    const { getByText } = render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );
    
    expect(getByText('Commencer gratuitement')).toBeInTheDocument();
    expect(getByText("J'ai déjà un compte")).toBeInTheDocument();
  });

  it('should render 4 step cards explaining how it works', () => {
    const { getByText } = render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );
    
    // New 4-step explanation
    expect(getByText('Choisis ton activité')).toBeInTheDocument();
    expect(getByText('Active ton signal')).toBeInTheDocument();
    expect(getByText('Reçois une notif')).toBeInTheDocument();
    expect(getByText('Approche facilement')).toBeInTheDocument();
  });

  it('should render the concrete example section', () => {
    const { getByText } = render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );
    
    expect(getByText('Exemple concret')).toBeInTheDocument();
  });

  it('should render footer with terms link', () => {
    const { getByText } = render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );
    
    expect(getByText(/conditions d'utilisation/)).toBeInTheDocument();
  });

  it('should render the value proposition', () => {
    const { getByText } = render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );
    
    expect(getByText(/approche ceux qui veulent être approchés/i)).toBeInTheDocument();
  });
});
