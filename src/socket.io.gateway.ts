import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';

@WebSocketGateway(6000, { cors: { origin: '*' } })
export class SocketIoGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: WebSocket;

  @SubscribeMessage('event')
  listenForMessages(@MessageBody() data: string) {}

  afterInit(server: WebSocket) {
    console.log(server);
  }

  handleDisconnect(client: WebSocket) {
    console.log(`Disconnected:`, client);
  }

  handleConnection(client: WebSocket, ...args: any[]) {
    console.log(`Connected:`, client);
  }
}
