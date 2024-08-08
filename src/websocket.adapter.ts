import * as WebSocket from 'ws';
import {
  WebSocketAdapter,
  INestApplicationContext,
  Logger,
} from '@nestjs/common';
import { MessageMappingProperties } from '@nestjs/websockets';
import { Observable, fromEvent, EMPTY } from 'rxjs';
import { mergeMap, filter } from 'rxjs/operators';
import * as http from 'http';

export class WsAdapter implements WebSocketAdapter {
  private logger = new Logger('WsAdapter');
  constructor(
    private app: INestApplicationContext,
    private srv: http.Server,
  ) {}

  create(port: number, options: any = {}): any {
    const server = new WebSocket.Server({
      server: this.srv,
      ...options,
    });
    return server;
  }

  bindClientConnect(server, callback: Function) {
    server.on('connection', callback);
  }

  bindMessageHandlers(
    client: WebSocket,
    handlers: MessageMappingProperties[],
    process: (data: any) => Observable<any>,
  ) {
    fromEvent(client, 'message')
      .pipe(
        mergeMap((data) => this.bindMessageHandler(data, handlers, process)),
        filter((result) => result),
      )
      .subscribe((response) => client.send(JSON.stringify(response)));
  }

  bindMessageHandler(
    buffer,
    handlers: MessageMappingProperties[],
    process: (data: any) => Observable<any>,
  ): Observable<any> {
    try {
      const message = JSON.parse(buffer.data);
      const messageHandler = handlers.find(
        (handler) => handler.message === message.event,
      );
      if (!messageHandler) {
        return EMPTY;
      }
      return process(messageHandler.callback(message.data));
    } catch (e) {
      this.logger.error('Parsing message error');
      return EMPTY;
    }
  }

  close(server) {
    server.close();
  }
}
