import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { WsAdapter } from './websocket.adapter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: true,
  });
  // app.useWebSocketAdapter(new ExtendedSocketIoAdapter(app.getHttpServer()));
  app.useWebSocketAdapter(new WsAdapter(app, app.getHttpServer()));
  await app.listen(3000);
}
bootstrap();
