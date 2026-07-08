import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-github2';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(configService: ConfigService) {
    super({
      clientID: configService.get<string>('auth.github.clientId') || '',
      clientSecret: configService.get<string>('auth.github.clientSecret') || '',
      callbackURL: configService.get<string>('auth.github.callbackUrl') || '',
      scope: ['user:email'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: any) {
    const { username, emails, photos } = profile;
    const user = {
      email: emails?.[0]?.value,
      displayName: profile.displayName || username,
      avatar: photos?.[0]?.value,
      provider: 'github',
      accessToken,
    };
    done(null, user);
  }
}
