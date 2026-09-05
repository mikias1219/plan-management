import { Controller, Get } from '@nestjs/common';
import { Public } from './common/decorators/public.decorator.js';

@Public()
@Controller()
export class HealthController {
  @Get('health')
  health() {
    return { ok: true };
  }
}
