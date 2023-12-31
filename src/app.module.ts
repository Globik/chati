import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { RoomGatewayModule } from './gateways/room-gateway/room.gateway.module';
import { MessageGatewayModule } from './gateways/message-gateway/message.gateway.module';
import { RoomModule } from './room/room.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { MessageModule } from './message/message.module';
import { JwtManager } from './auth/jwt/jwt.manager';
import { TicketModule } from './ticket/ticket.module';

@Module({
    imports: [
        ServeStaticModule.forRoot({
            rootPath: '/root/chatclient/dist',//join(__dirname, '..', 'storage/dist'),
            exclude: ['/api*', '/join']
        }),
        AuthModule,
        ConfigModule.forRoot({
            envFilePath: `.${process.env.NODE_ENV}.env`
        }),
        MongooseModule.forRoot('mongodb://localhost:27017'),
//mongodb://localhost:27017',//rocess.env.MONGO_URL),mongodb://api.chat-roulet.ru:27017/chatroulette_db'
        UserModule,
        MessageGatewayModule,
        RoomModule,
        MessageModule,
        TicketModule
    ],
    controllers: [],
    providers: [JwtManager],
})
export class AppModule {}
//    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
// vi src/app.module.ts
//
