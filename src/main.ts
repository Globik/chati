import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {NestExpressApplication} from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
//import  fs  from 'fs';
const fs = require("fs");
import {join} from 'path';

async function bootstrap() {
	var appConfig = {};
	if(process.env.NODE_ENV=="prod"){
		const httpsOptions = {
			key: fs.readFileSync('/etc/letsencrypt/live/chat-roulet.ru/privkey.pem'),// privkey.pem 
			// /root/nginx-ssl/certbot/conf/live/chat-roulet.ru/privkey.pem
			// /root/nginx-ssl/certbot/conf/live/chat-roulet.ru/fullchain.pem
			//root/nginx-ssl/certbot/conf/live/chat-roulet.ru/fullchain.pem
			cert: fs.readFileSync('/etc/letsencrypt/live/chat-roulet.ru/fullchain.pem') //fullchain.pem 
		};
		appConfig = { httpsOptions }
	}
	// certbot certonly --cert-name chat-roulet.ru

//Certificate is saved at: /etc/letsencrypt/live/chat-roulet.ru/fullchain.pem
//Key is saved at:         /etc/letsencrypt/live/chat-roulet.ru/privkey.pem

  const app = await NestFactory.create<NestExpressApplication>(AppModule, appConfig);
  
  var port;
  if(process.env.NODE_ENV=="prod"){
	  
   port = 431;
   
}else{
	port = process.env.PORT;
}

  const config = new DocumentBuilder()
    .setTitle('Чат-рулетка')
    .setVersion('1.0.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  let a=SwaggerModule.setup('/api/swagger', app, document);
   // console.log(document);
    
   // SwaggerModule.setup('/api/swagger/vk', app, document, {
   // customSiteTitle: 'Чат-рулетка',customfavIcon:'', url:'/vk'});
  
 // app.useStaticAssets(join(__dirname, '..', 'storage/dist'));
 app.useStaticAssets('/root/chatclient/dist');
  app.setGlobalPrefix('api');
  app.enableCors();

  app.useGlobalPipes(new ValidationPipe());

  await app.listen(port, () => console.log(`Server was started: http://localhost:${port}`));
}
bootstrap();



















