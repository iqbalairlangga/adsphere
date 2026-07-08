import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(configService: ConfigService) {
    super({
      clientID: configService.get<string>('auth.google.clientId') || '',
      clientSecret: configService.get<string>('auth.google.clientSecret') || '',
      callbackURL: configService.get<string>('auth.google.callbackUrl') || '',
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: (...args: any[]) => void,
  ): Promise<any> {
    const { name, emails, photos } = profile;
    const user = {
      email: emails?.[0]?.value,
      displayName: name?.givenName ? `${name.givenName} ${name.familyName}` : profile.displayName,
      avatar: photos?.[0]?.value,
      provider: 'google',
      accessToken,
    };
    done(null, user);
  }
}
