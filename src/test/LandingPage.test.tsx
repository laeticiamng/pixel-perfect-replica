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

  it('should render the main tagline', () => {
    const { getByText } = render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );
    
    expect(getByText(/ouvert·e à l'interaction/)).toBeInTheDocument();
  });

  it('should render the value proposition', () => {
    const { getByText } = render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );
    
    expect(getByText(/Lutte contre la solitude/)).toBeInTheDocument();
    expect(getByText(/Consentement mutuel/)).toBeInTheDocument();
  });

  it('should render the concept grid', () => {
    const { getByText } = render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );
    
    expect(getByText(/"Ouvert à..."/)).toBeInTheDocument();
    expect(getByText('Qui veut aussi')).toBeInTheDocument();
    expect(getByText('Une notif douce')).toBeInTheDocument();
    expect(getByText('Naturelle')).toBeInTheDocument();
  });

  it('should render use case example', () => {
    const { getByText } = render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );
    
    // First use case should be visible by default
    expect(getByText('Bibliothèque')).toBeInTheDocument();
  });

  it('should render differentiators section', () => {
    const { getByText } = render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );
    
    expect(getByText(/"Je suis ouvert à l'interaction"/)).toBeInTheDocument();
    expect(getByText('Consentement mutuel')).toBeInTheDocument();
    expect(getByText('Intention active')).toBeInTheDocument();
  });

  it('should render the closing pitch', () => {
    const { getByText } = render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );
    
    expect(getByText(/Tu n'es plus seul·e/)).toBeInTheDocument();
    expect(getByText(/ouvert à l'interaction/)).toBeInTheDocument();
  });

  it('should render the CTA buttons', () => {
    const { getByText } = render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );
    
    expect(getByText('Commencer gratuitement')).toBeInTheDocument();
    expect(getByText("J'ai déjà un compte")).toBeInTheDocument();
    expect(getByText('Essayer maintenant')).toBeInTheDocument();
  });

  it('should render footer with terms link', () => {
    const { getByText } = render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );
    
    expect(getByText(/conditions d'utilisation/)).toBeInTheDocument();
    expect(getByText(/politique de confidentialité/)).toBeInTheDocument();
  });
});
