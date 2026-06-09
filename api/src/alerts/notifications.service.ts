import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly config: ConfigService) {}

  isEmailConfigured() {
    return Boolean(this.config.get<string>('RESEND_API_KEY'));
  }

  async sendSlack(webhookUrl: string, text: string) {
    if (!webhookUrl || webhookUrl.includes('demo')) {
      this.logger.log(`[Slack demo] ${text}`);
      return { sent: false, demo: true };
    }

    try {
      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      return { sent: res.ok, status: res.status };
    } catch (err) {
      this.logger.warn(`Slack delivery failed: ${err}`);
      return { sent: false, error: String(err) };
    }
  }

  async sendEmail(to: string[], subject: string, body: string) {
    const apiKey = this.config.get<string>('RESEND_API_KEY');
    if (!apiKey) {
      this.logger.log(
        `[Email demo] To: ${to.join(', ')} — ${subject}: ${body}`,
      );
      return { sent: false, demo: true };
    }

    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from:
            this.config.get<string>('ALERT_FROM_EMAIL') ??
            'alerts@covalynce.io',
          to,
          subject,
          text: body,
        }),
      });
      return { sent: res.ok, status: res.status };
    } catch (err) {
      this.logger.warn(`Email delivery failed: ${err}`);
      return { sent: false, error: String(err) };
    }
  }
}
