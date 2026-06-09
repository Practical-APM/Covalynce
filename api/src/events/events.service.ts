import { Injectable, Logger } from '@nestjs/common';
import { TrackEventDto } from './dto/track-event.dto';

@Injectable()
export class EventsService {
  private readonly logger = new Logger('ProductAnalytics');

  track(organizationId: string, userId: string, dto: TrackEventDto) {
    this.logger.log(
      JSON.stringify({
        event: dto.event,
        organizationId,
        userId,
        properties: dto.properties ?? {},
        timestamp: new Date().toISOString(),
      }),
    );
    return { tracked: true, event: dto.event };
  }
}
