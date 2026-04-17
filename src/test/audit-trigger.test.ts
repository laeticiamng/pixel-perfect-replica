/**
 * Static contract tests for the `audit_sensitive_profile_changes` trigger.
 *
 * Goal: lock the *intent* (which fields trigger an audit row, what shape the
 * metadata has) without requiring a live DB. A full integration test would
 * need service-role credentials and a writable test profile, which we don't
 * expose to the client bundle. Migration drift is detected via the migration
 * file content, which is committed and read-only.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const MIGRATIONS_DIR = join(process.cwd(), 'supabase/migrations');

function findMigration(needle: string): string | null {
  const files = readdirSync(MIGRATIONS_DIR).filter((f) => f.endsWith('.sql'));
  for (const f of files) {
    const content = readFileSync(join(MIGRATIONS_DIR, f), 'utf8');
    if (content.includes(needle)) return content;
  }
  return null;
}

describe('audit_sensitive_profile_changes trigger', () => {
  const sql = findMigration('audit_sensitive_profile_changes');

  it('migration is committed', () => {
    expect(sql, 'expected a migration containing audit_sensitive_profile_changes').toBeTruthy();
  });

  it('runs as SECURITY DEFINER (must bypass RLS to write admin_audit_logs)', () => {
    expect(sql).toMatch(/SECURITY\s+DEFINER/i);
  });

  it('targets all sensitive profile fields', () => {
    const sensitive = [
      'is_premium',
      'is_city_guide',
      'shadow_banned',
      'purchased_sessions',
    ];
    for (const field of sensitive) {
      expect(sql, `expected trigger to reference ${field}`).toContain(field);
    }
  });

  it('writes into admin_audit_logs', () => {
    expect(sql).toMatch(/INSERT\s+INTO\s+(public\.)?admin_audit_logs/i);
  });

  it('captures actor via auth.uid() (not a hardcoded id)', () => {
    expect(sql).toMatch(/auth\.uid\(\)/);
  });

  it('is wired as an AFTER UPDATE trigger on profiles', () => {
    expect(sql).toMatch(/AFTER\s+UPDATE/i);
    expect(sql).toMatch(/ON\s+(public\.)?profiles/i);
  });
});
