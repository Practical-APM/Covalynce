import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { INTEGRATIONS_CATALOG } from './integration-auth.constants';

@ApiTags('integrations')
@Controller('api/v1/integrations')
export class IntegrationsController {
  @Get('catalog')
  catalog() {
    return {
      strategy: 'oauth_first',
      documentation: '/INTEGRATIONS_STRATEGY.md',
      integrations: INTEGRATIONS_CATALOG,
    };
  }
}
