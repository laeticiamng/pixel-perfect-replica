/**
 * Generate .ics calendar file content for sessions and events
 */

interface CalendarEvent {
  title: string;
  description?: string;
  location?: string;
  startDate: Date;
  endDate: Date;
  uid?: string;
}

/**
 * Escapes special characters for iCalendar format
 */
function escapeIcsText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

/**
 * Formats a date to iCalendar format (YYYYMMDDTHHmmssZ)
 */
function formatIcsDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

/**
 * Generates a unique ID for the calendar event
 */
function generateUid(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}@nearvity.app`;
}

/**
 * Creates .ics file content from event data
 */
export function generateIcsContent(event: CalendarEvent): string {
  const uid = event.uid || generateUid();
  const now = formatIcsDate(new Date());
  
  let icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//NEARVITY//Calendar Export//FR
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:${uid}
DTSTAMP:${now}
DTSTART:${formatIcsDate(event.startDate)}
DTEND:${formatIcsDate(event.endDate)}
SUMMARY:${escapeIcsText(event.title)}`;

  if (event.description) {
    icsContent += `\nDESCRIPTION:${escapeIcsText(event.description)}`;
  }

  if (event.location) {
    icsContent += `\nLOCATION:${escapeIcsText(event.location)}`;
  }

  icsContent += `
END:VEVENT
END:VCALENDAR`;

  return icsContent;
}

/**
 * Downloads the .ics file to user's device
 */
export function downloadIcsFile(event: CalendarEvent, filename?: string): void {
  const content = generateIcsContent(event);
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || `${event.title.replace(/[^a-z0-9]/gi, '_')}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Exports a session to calendar
 */
export function exportSessionToCalendar(session: {
  id: string;
  scheduled_date: string;
  start_time: string;
  duration_minutes: number;
  activity: string;
  city: string;
  location_name?: string;
  creator_name?: string;
  note?: string;
}): void {
  const [hours, minutes] = session.start_time.split(':').map(Number);
  const startDate = new Date(session.scheduled_date);
  startDate.setHours(hours, minutes, 0, 0);
  
  const endDate = new Date(startDate);
  endDate.setMinutes(endDate.getMinutes() + session.duration_minutes);
  
  const activityLabels: Record<string, string> = {
    studying: 'Réviser',
    eating: 'Manger',
    working: 'Bosser',
    talking: 'Parler',
    sport: 'Sport',
    other: 'Autre'
  };
  
  const activityLabel = activityLabels[session.activity] || session.activity;
  const title = `NEARVITY - Session ${activityLabel} à ${session.city}`;
  
  let description = `Session ${activityLabel} organisée via NEARVITY`;
  if (session.creator_name) {
    description += `\nOrganisateur: ${session.creator_name}`;
  }
  if (session.note) {
    description += `\n\n${session.note}`;
  }
  
  const location = session.location_name 
    ? `${session.location_name}, ${session.city}`
    : session.city;
  
  downloadIcsFile({
    title,
    description,
    location,
    startDate,
    endDate,
    uid: `session-${session.id}@nearvity.app`
  }, `nearvity-session-${session.scheduled_date}.ics`);
}

/**
 * Exports an event to calendar
 */
export function exportEventToCalendar(event: {
  id: string;
  name: string;
  description?: string;
  location_name: string;
  starts_at: string;
  ends_at: string;
}): void {
  downloadIcsFile({
    title: `NEARVITY - ${event.name}`,
    description: event.description || 'Événement organisé via NEARVITY',
    location: event.location_name,
    startDate: new Date(event.starts_at),
    endDate: new Date(event.ends_at),
    uid: `event-${event.id}@nearvity.app`
  }, `nearvity-event-${event.id}.ics`);
}
