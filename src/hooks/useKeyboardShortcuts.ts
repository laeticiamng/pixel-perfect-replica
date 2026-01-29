import { useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface ShortcutConfig {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  action: () => void;
  description: string;
}

export function useKeyboardShortcuts() {
  const navigate = useNavigate();
  const location = useLocation();

  // Define shortcuts
  const shortcuts: ShortcutConfig[] = [
    // Navigation shortcuts (Alt + key)
    {
      key: 'm',
      ctrlKey: true,
      shiftKey: true,
      action: () => navigate('/map'),
      description: 'Aller à la carte',
    },
    {
      key: 'p',
      ctrlKey: true,
      shiftKey: true,
      action: () => navigate('/profile'),
      description: 'Aller au profil',
    },
    {
      key: 'b',
      ctrlKey: true,
      shiftKey: true,
      action: () => navigate('/binome'),
      description: 'Aller au binôme',
    },
    {
      key: 'e',
      ctrlKey: true,
      shiftKey: true,
      action: () => navigate('/events'),
      description: 'Aller aux événements',
    },
    {
      key: 's',
      ctrlKey: true,
      shiftKey: true,
      action: () => navigate('/settings'),
      description: 'Aller aux paramètres',
    },
    // Go back with Backspace (when not in input)
    {
      key: 'Backspace',
      action: () => {
        if (location.pathname !== '/' && location.pathname !== '/map') {
          navigate(-1);
        }
      },
      description: 'Retour',
    },
    // Home with Escape (from deep pages)
    {
      key: 'Escape',
      action: () => {
        // Close any open modals first (handled by individual components)
        // Then navigate home if on a deep page
        const deepPages = ['/profile/edit', '/change-password', '/data-export'];
        if (deepPages.some(p => location.pathname.startsWith(p))) {
          navigate(-1);
        }
      },
      description: 'Fermer / Retour',
    },
  ];

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Don't trigger shortcuts when typing in inputs
    const target = event.target as HTMLElement;
    const isInputFocused = 
      target.tagName === 'INPUT' || 
      target.tagName === 'TEXTAREA' || 
      target.isContentEditable;

    // Allow Escape even in inputs
    if (isInputFocused && event.key !== 'Escape') {
      return;
    }

    for (const shortcut of shortcuts) {
      const ctrlMatch = shortcut.ctrlKey ? (event.ctrlKey || event.metaKey) : true;
      const shiftMatch = shortcut.shiftKey ? event.shiftKey : !event.shiftKey;
      const metaMatch = shortcut.metaKey ? event.metaKey : true;

      if (
        event.key.toLowerCase() === shortcut.key.toLowerCase() &&
        ctrlMatch &&
        shiftMatch &&
        metaMatch
      ) {
        // Don't prevent default for Escape (let modals handle it first)
        if (event.key !== 'Escape') {
          event.preventDefault();
        }
        shortcut.action();
        break;
      }
    }
  }, [navigate, location.pathname]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return { shortcuts };
}

// Hook to show keyboard shortcut hints
export function useShortcutHint() {
  const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
  
  return {
    cmdKey: isMac ? '⌘' : 'Ctrl',
    altKey: isMac ? '⌥' : 'Alt',
    shiftKey: '⇧',
    formatShortcut: (key: string, ctrl = false, shift = false) => {
      const parts: string[] = [];
      if (ctrl) parts.push(isMac ? '⌘' : 'Ctrl');
      if (shift) parts.push('⇧');
      parts.push(key.toUpperCase());
      return parts.join(isMac ? '' : '+');
    },
  };
}
