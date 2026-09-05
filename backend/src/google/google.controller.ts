import { Controller, Delete, Get, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { Public } from '../common/decorators/public.decorator.js';
import { GoogleService } from './google.service.js';

function oauthPage(ok: boolean, message: string, href: string) {
  const title = ok ? 'Google connected' : 'Could not connect Google';
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta http-equiv="refresh" content="0;url=${href}" />
  <title>${title}</title>
  <style>
    body { font-family: system-ui, sans-serif; background: #F6F5F2; color: #1C1917; padding: 48px 24px; text-align: center; }
    a { color: #0F766E; font-weight: 600; }
  </style>
</head>
<body>
  <h1>${title}</h1>
  <p>${message}</p>
  <p><a href="${href}">Open Life OS</a></p>
</body>
</html>`;
}

@Controller('google')
export class GoogleController {
  constructor(private readonly google: GoogleService) {}

  @Get('status')
  status(@CurrentUser('userId') userId: string) {
    return this.google.status(userId);
  }

  @Get('oauth/url')
  authUrl(@CurrentUser('userId') userId: string) {
    return this.google.getAuthUrl(userId);
  }

  @Public()
  @Get('oauth/callback')
  async callback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Query('error') error: string,
    @Res() res: Response,
  ) {
    const fallback = 'lifeos://google-connected';
    if (error || !code || !state) {
      return res.status(400).type('html').send(
        oauthPage(false, error ? `Google returned: ${error}` : 'Google did not finish connecting.', `${fallback}?ok=0`),
      );
    }
    try {
      const redirect = await this.google.handleCallback(code, state);
      return res.type('html').send(oauthPage(true, 'You can return to Life OS.', redirect));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not connect Google.';
      return res.status(400).type('html').send(oauthPage(false, message, `${fallback}?ok=0`));
    }
  }

  @Delete('oauth')
  disconnect(@CurrentUser('userId') userId: string) {
    return this.google.disconnect(userId);
  }

  @Get('docs')
  listDocs(@CurrentUser('userId') userId: string) {
    return this.google.listDocuments(userId);
  }
}
