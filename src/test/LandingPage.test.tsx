import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
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
    render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );
    
    expect(screen.getByText('SIGNAL')).toBeInTheDocument();
  });

  it('should render the tagline', () => {
    render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );
    
    // Updated tagline
    expect(screen.getByText(/ouvert à l'interaction/)).toBeInTheDocument();
  });

  it('should render the CTA buttons', () => {
    render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Commencer')).toBeInTheDocument();
    expect(screen.getByText("J'ai déjà un compte")).toBeInTheDocument();
  });

  it('should render 3 feature cards', () => {
    render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Signale que tu es ouvert')).toBeInTheDocument();
    expect(screen.getByText('Vois les signaux autour')).toBeInTheDocument();
    expect(screen.getByText('Approche sans awkwardness')).toBeInTheDocument();
  });

  it('should render footer with terms link', () => {
    render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );
    
    expect(screen.getByText(/conditions d'utilisation/)).toBeInTheDocument();
  });
});
