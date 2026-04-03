import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { CallSession } from './entities/call-session.entity';
import { VideoController } from './video.controller';
import { VideoService } from './video.service';
import { VideoGateway } from './video.gateway';
import { JwtStrategy } from '../../common/strategies/jwt.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([CallSession]),
    PassportModule,
    JwtModule.registerAsync({
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_SECRET', 'secret'),
        signOptions: { expiresIn: '7d' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [VideoController],
  providers: [VideoService, VideoGateway, JwtStrategy],
  exports: [VideoService],
})
export class VideoModule {}
