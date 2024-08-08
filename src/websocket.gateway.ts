import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { WebSocketServer as Serv } from 'ws';

@WebSocketGateway(6000, { cors: { origin: '*' }, path: '/ws' })
export class ExtendWebSocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Serv;

  @SubscribeMessage('event')
  listenForMessages(@MessageBody() data: string) {
    console.log(data);
  }

  afterInit(server: Serv) {}

  handleDisconnect(client: WebSocket) {}

  handleConnection(@ConnectedSocket() client: WebSocket, ...args: any[]) {}
}
