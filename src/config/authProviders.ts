/**
 * OAuth provider capability configuration.
 * Controls which social login buttons are displayed.
 * Set to `false` to hide a provider's button across the app.
 */
export const AUTH_PROVIDERS = {
  google: {
    enabled: true,
    id: 'google' as const,
  },
  apple: {
    enabled: true,
    id: 'apple' as const,
  },
} as const;

export type OAuthProviderId = 'google' | 'apple';

export function isProviderEnabled(provider: OAuthProviderId): boolean {
  return AUTH_PROVIDERS[provider]?.enabled ?? false;
}
