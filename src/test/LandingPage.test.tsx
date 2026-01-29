import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LandingPage from '@/pages/LandingPage';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    h1: ({ children, ...props }: any) => <h1 {...props}>{children}</h1>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
    section: ({ children, ...props }: any) => <section {...props}>{children}</section>,
  },
  useScroll: () => ({ scrollYProgress: { current: 0 } }),
  useTransform: () => 1,
  useInView: () => true,
  AnimatePresence: ({ children }: any) => children,
}));

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
    
    expect(getByText(/Vois qui est/)).toBeInTheDocument();
    expect(getByText(/ouvert/)).toBeInTheDocument();
  });

  it('should render the badge', () => {
    const { getByText } = render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );
    
    expect(getByText('La rencontre réinventée')).toBeInTheDocument();
  });

  it('should render the problem statement', () => {
    const { getByText } = render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );
    
    expect(getByText(/veut être approchée/)).toBeInTheDocument();
  });

  it('should render the signal section', () => {
    const { getByText } = render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );
    
    expect(getByText(/signal vert/)).toBeInTheDocument();
    expect(getByText(/change tout/)).toBeInTheDocument();
  });

  it('should render feature cards', () => {
    const { getByText } = render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );
    
    expect(getByText('Lutte contre la solitude')).toBeInTheDocument();
    expect(getByText('Zéro approche gênante')).toBeInTheDocument();
    expect(getByText('Ancré dans le réel')).toBeInTheDocument();
  });

  it('should render the comparison section', () => {
    const { getByText } = render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );
    
    expect(getByText('On ne connecte pas des profils.')).toBeInTheDocument();
    expect(getByText('On connecte des intentions.')).toBeInTheDocument();
  });

  it('should render use cases', () => {
    const { getByText } = render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );
    
    expect(getByText('Bibliothèque')).toBeInTheDocument();
    expect(getByText('Salle de sport')).toBeInTheDocument();
    expect(getByText('Café')).toBeInTheDocument();
    expect(getByText('Coworking')).toBeInTheDocument();
  });

  it('should render the CTA buttons', () => {
    const { getByText } = render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );
    
    expect(getByText('Commencer')).toBeInTheDocument();
    expect(getByText('Se connecter')).toBeInTheDocument();
  });

  it('should render final CTA', () => {
    const { getByText } = render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );
    
    expect(getByText('Commencer maintenant')).toBeInTheDocument();
  });

  it('should render footer with links', () => {
    const { getByText } = render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );
    
    expect(getByText('EASY')).toBeInTheDocument();
    expect(getByText('Conditions')).toBeInTheDocument();
    expect(getByText('Confidentialité')).toBeInTheDocument();
  });
});
