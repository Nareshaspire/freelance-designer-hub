import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { Conversation } from './entities/conversation.entity';
import { Message } from './entities/message.entity';
import { Notification } from './entities/notification.entity';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { NotificationsModule } from '../notifications/notifications.module';
import { JwtStrategy } from '../../common/strategies/jwt.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([Conversation, Message, Notification]),
    PassportModule,
    JwtModule.registerAsync({
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_SECRET', 'secret'),
        signOptions: { expiresIn: '7d' },
      }),
      inject: [ConfigService],
    }),
    NotificationsModule,
  ],
  controllers: [ChatController],
  providers: [ChatService, ChatGateway, JwtStrategy],
  exports: [ChatService],
})
export class ChatModule {}
