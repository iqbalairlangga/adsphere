import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: string;
}

@WebSocketGateway({
  cors: {
    origin: (process.env.CORS_ORIGIN || 'http://localhost:4200').split(','),
    credentials: true,
  },
  namespace: '/ws',
  transports: ['websocket', 'polling'],
})
export class WebsocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(WebsocketGateway.name);
  private connectedClients: Map<string, Set<string>> = new Map();

  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  afterInit(): void {
    this.logger.log('WebSocket Gateway initialized');
  }

  async handleConnection(client: AuthenticatedSocket): Promise<void> {
    try {
      const token =
        client.handshake.auth?.token ||
        client.handshake.query?.token as string;

      if (token) {
        const payload = await this.jwtService.verifyAsync(token, {
          secret: this.configService.get<string>('auth.jwtSecret'),
        });
        client.userId = payload.sub;
        client.userRole = payload.role;

        await client.join(`user:${payload.sub}`);

        if (!this.connectedClients.has(payload.sub)) {
          this.connectedClients.set(payload.sub, new Set());
        }
        this.connectedClients.get(payload.sub)?.add(client.id);

        this.logger.log(`Client connected: ${payload.sub} (${client.id})`);

        client.emit('connected', {
          userId: payload.sub,
          message: 'Connected to AdSphere realtime service',
        });
      } else {
        await client.join('public');
        this.logger.log(`Anonymous client connected: ${client.id}`);
      }
    } catch (error) {
      this.logger.warn(`Client connection rejected: ${(error as Error).message}`);
      client.emit('error', { message: 'Authentication failed' });
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket): void {
    if (client.userId) {
      const userSockets = this.connectedClients.get(client.userId);
      if (userSockets) {
        userSockets.delete(client.id);
        if (userSockets.size === 0) {
          this.connectedClients.delete(client.userId);
        }
      }
      this.logger.log(`Client disconnected: ${client.userId} (${client.id})`);
    } else {
      this.logger.log(`Anonymous client disconnected: ${client.id}`);
    }
  }

  @SubscribeMessage('subscribe')
  handleSubscribe(client: AuthenticatedSocket, payload: { channel: string }): void {
    if (payload.channel) {
      client.join(payload.channel);
      client.emit('subscribed', { channel: payload.channel });
      this.logger.log(`Client ${client.id} subscribed to ${payload.channel}`);
    }
  }

  @SubscribeMessage('unsubscribe')
  handleUnsubscribe(client: AuthenticatedSocket, payload: { channel: string }): void {
    if (payload.channel) {
      client.leave(payload.channel);
      client.emit('unsubscribed', { channel: payload.channel });
    }
  }

  @SubscribeMessage('ping')
  handlePing(client: AuthenticatedSocket): void {
    client.emit('pong', {
      timestamp: new Date().toISOString(),
      serverTime: Date.now(),
    });
  }

  sendToUser(userId: string, event: string, data: unknown): void {
    this.server.to(`user:${userId}`).emit(event, data);
  }

  sendToChannel(channel: string, event: string, data: unknown): void {
    this.server.to(channel).emit(event, data);
  }

  broadcast(event: string, data: unknown): void {
    this.server.emit(event, data);
  }

  emitNotification(userId: string, notification: {
    id: string;
    title: string;
    message: string;
    type: string;
    channel: string;
    createdAt: Date;
  }): void {
    this.sendToUser(userId, 'notification', notification);
  }

  emitAnalyticsUpdate(userId: string, data: Record<string, unknown>): void {
    this.sendToUser(userId, 'analytics:update', data);
  }

  emitCampaignUpdate(userId: string, campaignId: string, data: Record<string, unknown>): void {
    this.sendToUser(userId, 'campaign:update', { campaignId, ...data });
  }

  emitFraudAlert(userId: string, data: Record<string, unknown>): void {
    this.sendToUser(userId, 'fraud:alert', data);
  }

  getConnectedUsersCount(): number {
    return this.connectedClients.size;
  }

  getConnectedClients(): number {
    return this.server.engine.clientsCount;
  }

  isUserOnline(userId: string): boolean {
    return this.connectedClients.has(userId);
  }
}
