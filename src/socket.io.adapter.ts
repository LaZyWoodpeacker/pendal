import { IoAdapter } from '@nestjs/platform-socket.io';
import * as io from 'socket.io';
import * as http from 'http';
export class ExtendedSocketIoAdapter extends IoAdapter {
  protected ioServer: io.Server;
  constructor(protected server: http.Server) {
    super();
    this.ioServer = new io.Server(server);
  }

  create(port: number) {
    console.log(
      'websocket gateway port argument is ignored by ExtendedSocketIoAdapter, use the same port of http instead',
    );
    return this.ioServer;
  }
}
