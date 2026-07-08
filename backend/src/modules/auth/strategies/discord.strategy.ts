import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-discord';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DiscordStrategy extends PassportStrategy(Strategy, 'discord') {
  constructor(configService: ConfigService) {
    super({
      clientID: configService.get<string>('auth.discord.clientId') || '',
      clientSecret: configService.get<string>('auth.discord.clientSecret') || '',
      callbackURL: configService.get<string>('auth.discord.callbackUrl') || '',
      scope: ['identify', 'email'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: any) {
    const { email, username, avatar } = profile;
    const user = {
      email,
      displayName: username,
      avatar: avatar ? `https://cdn.discordapp.com/avatars/${profile.id}/${avatar}.png` : null,
      provider: 'discord',
      accessToken,
    };
    done(null, user);
  }
}
