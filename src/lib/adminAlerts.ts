import { supabase } from '@/integrations/supabase/client';

type AlertType = 'new_user' | 'high_reports' | 'error_spike' | 'custom';

interface SendAlertParams {
  alert_type: AlertType;
  subject: string;
  message: string;
  metadata?: Record<string, unknown>;
}

export async function sendAdminAlert({ alert_type, subject, message, metadata }: SendAlertParams) {
  try {
    const { data, error } = await supabase.functions.invoke('notifications', {
      body: {
        action: 'send-admin-alert',
        alert_type,
        subject,
        message,
        metadata,
      },
    });

    if (error) {
      console.error('Failed to send admin alert:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error sending admin alert:', error);
    return { success: false, error };
  }
}

// Pre-configured alert functions for common scenarios
export const adminAlerts = {
  // Alert when a new user signs up
  newUser: (email: string, userId: string) =>
    sendAdminAlert({
      alert_type: 'new_user',
      subject: 'Nouvel utilisateur inscrit',
      message: `Un nouvel utilisateur vient de s'inscrire sur Signal avec l'email ${email}.`,
      metadata: { email, userId, timestamp: new Date().toISOString() },
    }),

  // Alert when report threshold is exceeded
  highReports: (reportCount: number, reportedUserId: string) =>
    sendAdminAlert({
      alert_type: 'high_reports',
      subject: `${reportCount} signalements pour un utilisateur`,
      message: `Un utilisateur a reçu ${reportCount} signalements. Une modération peut être nécessaire.`,
      metadata: { reportCount, reportedUserId, timestamp: new Date().toISOString() },
    }),

  // Alert when error rate spikes
  errorSpike: (errorCount: number, timeWindow: string) =>
    sendAdminAlert({
      alert_type: 'error_spike',
      subject: `Pic d'erreurs détecté`,
      message: `${errorCount} erreurs détectées dans les ${timeWindow}. Vérifiez les logs pour plus de détails.`,
      metadata: { errorCount, timeWindow, timestamp: new Date().toISOString() },
    }),

  // Custom alert for any scenario
  custom: (subject: string, message: string, metadata?: Record<string, unknown>) =>
    sendAdminAlert({
      alert_type: 'custom',
      subject,
      message,
      metadata,
    }),
};
