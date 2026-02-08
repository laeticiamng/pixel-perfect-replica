import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { translations } from '@/lib/i18n/translations';

// Helper: resolve translation key to French string
function getFrench(key: string): string {
  const keys = key.split('.');
  let current: any = translations;
  for (const k of keys) {
    if (!current) return key;
    current = current[k];
  }
  return current?.fr ?? key;
}

// Mock i18n to return French translations (tests were written with French UI)
vi.mock('@/lib/i18n', () => ({
  useTranslation: () => ({
    t: (key: string) => getFrench(key),
    locale: 'fr',
    setLocale: vi.fn(),
    toggleLocale: vi.fn(),
    isEnglish: false,
    isFrench: true,
  }),
}));

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

  it('should render the main title', async () => {
    const { default: LandingPage } = await import('@/pages/LandingPage');
    const { getByText } = render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );

    expect(getByText(/Vois qui est/)).toBeInTheDocument();
    expect(getByText(/dispo/)).toBeInTheDocument();
  });

  it('should render the badge', async () => {
    const { default: LandingPage } = await import('@/pages/LandingPage');
    const { getByText } = render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );

    expect(getByText('La rencontre réinventée')).toBeInTheDocument();
  });

  it('should render the problem statement', async () => {
    const { default: LandingPage } = await import('@/pages/LandingPage');
    const { getByText } = render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );

    expect(getByText(/NEARVITY te le montre/)).toBeInTheDocument();
  });

  it('should render the signal section', async () => {
    const { default: LandingPage } = await import('@/pages/LandingPage');
    const { getAllByText } = render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );

    expect(getAllByText(/signal vert/).length).toBeGreaterThan(0);
    expect(getAllByText(/change tout/).length).toBeGreaterThan(0);
  });

  it('should render feature cards', async () => {
    const { default: LandingPage } = await import('@/pages/LandingPage');
    const { getByText } = render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );

    expect(getByText('Lutte contre la solitude')).toBeInTheDocument();
    expect(getByText('Zéro approche gênante')).toBeInTheDocument();
    expect(getByText('Ancré dans le réel')).toBeInTheDocument();
  });

  it('should render the comparison section', async () => {
    const { default: LandingPage } = await import('@/pages/LandingPage');
    const { getByText } = render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );

    expect(getByText('On ne connecte pas des profils.')).toBeInTheDocument();
    expect(getByText('On connecte des intentions.')).toBeInTheDocument();
  });

  it('should render use cases', async () => {
    const { default: LandingPage } = await import('@/pages/LandingPage');
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

  it('should render the CTA buttons', async () => {
    const { default: LandingPage } = await import('@/pages/LandingPage');
    const { getByText, getAllByText } = render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );

    expect(getByText('Commencer')).toBeInTheDocument();
    expect(getAllByText('Se connecter').length).toBeGreaterThan(0);
  });

  it('should render final CTA', async () => {
    const { default: LandingPage } = await import('@/pages/LandingPage');
    const { getByText } = render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );

    expect(getByText('Commencer maintenant')).toBeInTheDocument();
  });

  it('should render footer with links', async () => {
    const { default: LandingPage } = await import('@/pages/LandingPage');
    const { getAllByText } = render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );

    expect(getAllByText('NEARVITY').length).toBeGreaterThan(0);
    expect(getAllByText('Conditions').length).toBeGreaterThan(0);
    expect(getAllByText('Confidentialité').length).toBeGreaterThan(0);
  });
});
