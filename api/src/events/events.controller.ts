import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthUser } from '../common/decorators/current-user.decorator';
import { TrackEventDto } from './dto/track-event.dto';
import { EventsService } from './events.service';

@ApiTags('events')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/events')
export class EventsController {
  constructor(private readonly events: EventsService) {}

  @Post()
  track(@CurrentUser() user: AuthUser, @Body() dto: TrackEventDto) {
    return this.events.track(user.organizationId, user.userId, dto);
  }
}
