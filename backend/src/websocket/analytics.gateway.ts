import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3000'],
    credentials: true,
  },
  namespace: '/analytics',
})
export class AnalyticsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(AnalyticsGateway.name);
  private connectedClients = new Map<string, Set<string>>();

  constructor(private configService: ConfigService) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token || client.handshake.query?.token;
      if (!token) {
        client.disconnect();
        return;
      }

      const payload = jwt.verify(
        token as string,
        this.configService.get<string>('auth.jwtSecret') || 'secret',
      ) as { sub: string; role: string };

      client.data.userId = payload.sub;
      client.data.role = payload.role;

      if (!this.connectedClients.has(payload.sub)) {
        this.connectedClients.set(payload.sub, new Set());
      }
      this.connectedClients.get(payload.sub)!.add(client.id);

      client.join(`user:${payload.sub}`);

      if (payload.role === 'SUPER_ADMIN' || payload.role === 'ADMIN') {
        client.join('admin');
      }

      this.logger.log(`Client connected: ${payload.sub} (${client.id})`);
      this.broadcastOnlineUsers();
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data.userId;
    if (userId && this.connectedClients.has(userId)) {
      this.connectedClients.get(userId)!.delete(client.id);
      if (this.connectedClients.get(userId)!.size === 0) {
        this.connectedClients.delete(userId);
      }
    }
    this.broadcastOnlineUsers();
    this.logger.log(`Client disconnected: ${userId} (${client.id})`);
  }

  @SubscribeMessage('subscribe:campaign')
  handleCampaignSubscribe(client: Socket, campaignId: string) {
    client.join(`campaign:${campaignId}`);
  }

  @SubscribeMessage('unsubscribe:campaign')
  handleCampaignUnsubscribe(client: Socket, campaignId: string) {
    client.leave(`campaign:${campaignId}`);
  }

  emitMetric(userId: string, event: string, data: any) {
    this.server.to(`user:${userId}`).emit(event, data);
  }

  emitCampaignMetric(campaignId: string, event: string, data: any) {
    this.server.to(`campaign:${campaignId}`).emit(event, data);
  }

  emitAdminMetric(event: string, data: any) {
    this.server.to('admin').emit(event, data);
  }

  private broadcastOnlineUsers() {
    const count = this.connectedClients.size;
    this.server.emit('online:users', { count });
  }
}
