import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { BidModule } from './bid/bid.module';
import { Bid } from './bid/entities/bid.entity';
import { TaskModule } from './task/task.module';
import { Task } from './task/entities/task.entity';
import { PendalLoggerModule } from './pendal-logger/pendal-logger.module';
import { LoggerMiddleware } from './pendal-logger/pendal-logger.http.logger';
import { OnecModule } from './onec/onec.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
    }),
    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: process.env.DB_SERVER,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_BASE,
      models: [Bid, Task],
      autoLoadModels: true,
      synchronize: true,
      logging: false,
    }),
    PendalLoggerModule,
    BidModule,
    TaskModule,
    PendalLoggerModule,
    OnecModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
