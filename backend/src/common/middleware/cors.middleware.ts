import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class CorsMiddleware implements NestMiddleware {
  private readonly logger = new Logger(CorsMiddleware.name);

  use(req: Request, res: Response, next: NextFunction): void {
    const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:4200').split(',');
    const origin = req.headers.origin as string;

    if (origin && allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    } else if (!origin) {
      res.setHeader('Access-Control-Allow-Origin', '*');
    }

    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader(
      'Access-Control-Allow-Methods',
      'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    );
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Content-Type,Accept,Authorization,X-Requested-With,Origin,X-CSRF-Token',
    );
    res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
    res.setHeader('Access-Control-Max-Age', '86400');

    if (req.method === 'OPTIONS') {
      res.status(204).end();
      return;
    }

    next();
  }
}
