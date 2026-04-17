/// <reference types="node" />
/**
 * Static contract tests for the `audit_sensitive_profile_changes` trigger.
 *
 * Goal: lock the *intent* (which fields trigger an audit row) without needing
 * a live DB. The migration file is the source of truth — we assert its shape.
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

  it('runs as SECURITY DEFINER with locked search_path', () => {
    expect(sql).toMatch(/security\s+definer/i);
    expect(sql).toMatch(/set\s+search_path\s*=\s*public/i);
  });

  it('monitors all sensitive profile fields', () => {
    const fields = ['is_premium', 'shadow_banned', 'shadow_ban_reason', 'shadow_banned_until', 'purchased_sessions', 'is_city_guide'];
    for (const f of fields) {
      expect(sql, `expected trigger to reference field ${f}`).toMatch(new RegExp(f));
    }
  });

  it('writes to admin_audit_logs', () => {
    expect(sql).toMatch(/admin_audit_logs/);
  });

  it('captures both old and new values', () => {
    expect(sql).toMatch(/OLD\./);
    expect(sql).toMatch(/NEW\./);
  });

  it('is attached as an AFTER UPDATE trigger on profiles', () => {
    expect(sql).toMatch(/create\s+trigger[\s\S]*after\s+update[\s\S]*on\s+(public\.)?profiles/i);
  });
});
