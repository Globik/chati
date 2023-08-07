import { OnModuleInit, UseGuards } from "@nestjs/common";
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from 'socket.io';
import { WsGuard } from "src/auth/jwt/ws.guard";
import { RoomGatewayService } from "./room.gateway.service";
import { FindNewRoomDto } from "./dto/findNewRoom.dto";
import { UserService } from "src/user/user.service";
import { User } from "src/user/schemas/user.schema";
import { LeaveRoomDto } from "./dto/leaveRoom.dto";
import { Queue } from "./queue";

const onesignal_app_key = "NWY5YmQ3NTMtMDY2ZS00NjE1LTkyY2MtOTIyZDQ0ZTEwYzgz";
// NWY5YmQ3NTMtMDY2ZS00NjE1LTkyY2MtOTIyZDQ0ZTEwYzgz
const onesignal_app_id = "db934412-4ede-4f65-bec7-100941d1671d";
// "db934412-4ede-4f65-bec7-100941d1671d"
const onesignal_notification_url = "https://onesignal.com/api/v1/notifications";
const axios = require('axios').default;


async function oni(us, txt){
	if(process.env.DEVELOPMENT !="yes"){

let data = {
		app_id: onesignal_app_id,
		contents: {en: us + " " + txt},
	included_segments: ["Subscribed Users"],
		//include_player_ids: ["9a9c34d6-6c6e-4dfe-b510-20953def482f"],
		};
let headers = { "Authorization": "Basic " + onesignal_app_key };
try{
let r = await axios.post(onesignal_notification_url, data, { headers: headers });
console.log("r: ", r.data);
}catch(e){
console.log("err: ", e);
}	
}
}


@WebSocketGateway({ cors: true })
export class RoomGateway implements OnGatewayConnection, OnGatewayDisconnect {

    constructor(private readonly gatewayService: RoomGatewayService,
        private readonly userService: UserService) { }

    @WebSocketServer() 
    private server: Server;
    
   queue: Queue[] = [];// здесь я предлагаю не массив использовать , а queue = new Map();
	q = new Map<string, any>();
    async handleConnection(@ConnectedSocket() socket: Socket) {
       
     this.q.set(socket.id, { socketId: socket.id, isBusy: true });
        this.server.emit("usercount", { count: this.q.size});
        oni("We are here", " chat-roulet.ru");
    }
//   vi /root/chatroulette/chatroulette/src/gateways/room-gateway/room.gateway.ts
    async handleDisconnect(@ConnectedSocket() socket: Socket) {   
    
        
        
        let a = this.q.get(socket.id);
        if(a){
			if(a.partner){
			this.server.to(a.partner).emit('onLeaveRoom', {
            membersId: a.partner,
            roomId: socket.id});
            const memberSocket = this.server.sockets.sockets.get(socket.id);
            if(memberSocket) memberSocket.leave(a.roomId);
            const memberSocket2 = this.server.sockets.sockets.get(a.partner);
            if(memberSocket2) memberSocket2.leave(a.roomId);
		}
		}
        
    //   console.log("on disconnect");
        this.q.delete(socket.id);
      this.server.emit("usercount", { count: this.q.size});
    }

    //@UseGuards(WsGuard)
    @SubscribeMessage('joinToQueue')
    async joinToQueue(@MessageBody() dto: FindNewRoomDto, @ConnectedSocket() socket: Socket) {
		console.log("dto: ", dto);
      /*  let user = await this.userService.getUserById(dto.userId).catch((e) => {
			console.log(e.message, e.status);
            this.server.to(socket.id).emit('onException', {
                statusCode: e.status,
                message: e.message
            });

         //   stop();//undefined
        }) as User;

      */
		let q = this.q.has(socket.id);
		if(q){
			let a = this.q.get(socket.id);
			a.userId = dto.userId;
			a.gender = dto.gender;
			a.country = dto.country;
			a.isBusy = false;
			a.countries = dto.countries;
			a.nick = dto.nick;
			a.flag = dto.flag;
			a.mygender = dto.mygender;
			a.suechgender = dto.suechgender;
		}
		 
        socket.emit("onJoinToQueue", {
            status: "OK"
        });
    }
//   vi /root/chatroulette/chatroulette/src/gateways/room-gateway/room.gateway.ts
    //@UseGuards(WsGuard)
    @SubscribeMessage('findRoom')
    async findNewRoom(@MessageBody() dto: FindNewRoomDto, @ConnectedSocket() socket: Socket) {
	
	
		let mapToArray = [...this.q.values()]
	//	console.log("*** ARR *** ", mapToArray);
		let filter = mapToArray.filter(u => u.country === dto.country 
              && u.gender === dto.gender 
              && u.socketId !== socket.id
             && !u.isBusy)

 let random;
 
 if(filter.length){
	 console.log("length");
	 random = filter[Math.floor(Math.random() * filter.length)];
 }
 
 if(!random){
	 filter = mapToArray.filter(queue => (queue.country === dto.country 
                  || queue.gender === dto.gender) 
                  && queue.socketId !== socket.id
                  && !queue.isBusy);
 }
 if(filter.length){
	  random = filter[Math.floor(Math.random() * filter.length)];
 }
 if(!random){
	 filter = mapToArray.filter(queue => !queue.isBusy && queue.socketId !== socket.id);
 }
 if(filter.length){
	 random = filter[Math.floor(Math.random() * filter.length)];
 }
 
 
 if(!random){
	 
	 return;
 }
	
          let myqueue = this.q.get(socket.id);
          
          let roomId = await this.gatewayService.create([dto.userId, random.userId]).catch((e) => {
              this.server.to(socket.id).emit('onException', {
                  statusCode: e.status,
                  message: e.message
              });
  
              stop();
          });
   
          socket.join(roomId);
         
  if(myqueue) {
	  myqueue.isBusy = true;
	  myqueue.partner = random.socketId;
  }
          const partnerSocket = this.server.sockets.sockets.get(random.socketId);
         if(partnerSocket) partnerSocket.join(roomId);
         
          
          let abba = this.q.get(random.socketId);
          if(abba){
			  abba.isBusy = true;
			abba.partner = socket.id
		  }
	
          this.server.to(random.socketId).emit("waitOffer", {from: socket.id, nick: dto.nick, roomId: roomId, gender: dto.gender, country: dto.country,
			  flag: dto.flag
			  });
          this.server.to(socket.id).emit("makeOffer", {to: random.socketId, nick: random.nick, roomId: roomId, gender: random.gender, country: random.country,
			  flag: random.flag
			  });
      }

@SubscribeMessage('bye')
    async onBye( @ConnectedSocket() socket: Socket) {
		
		let q = this.q.get(socket.id);
		if(q){
			q.isBusy = true;
			q.partner = undefined;
		}
		
	}



    //@UseGuards(WsGuard)
    @SubscribeMessage('leaveRoom')
    async onLeaveRoom(@MessageBody() dto: LeaveRoomDto, @ConnectedSocket() socket: Socket) {
		
        await this.gatewayService.leave(dto).catch((e) => {
			//console.log(e.message, dto);
            this.server.to(socket.id).emit('onException', {
                statusCode: e.status,
                message: e.message
            });

         stop();// undefined
        });

        this.server.to(dto.membersId).emit('onLeaveRoom', {
            membersId: dto.membersId,
        });

     
                    const memberSocket = this.server.sockets.sockets.get(socket.id);
                   if(memberSocket) memberSocket.leave(dto.roomId);

        let q = this.q.get(dto.to);
        if(q){
			q.partner = undefined;
			q.isBusy = false;
		} 
		let a = this.q.get(dto.membersId.toString());
		if(a){
			a.partner = undefined;
			a.isBusy = false;
		}
       
       
    }
	 @SubscribeMessage("newMessage1")
    handleMessage(@MessageBody() data: { name: string, roomId: string, text: string, userId: string }) {
        this.server.to(data.roomId).emit("onNewMessage1", data);
    }
    //@UseGuards(WsGuard)
    @SubscribeMessage('offer')
    handleOffer(@MessageBody() data: { offer: any, roomId: string }) {
        this.server.to(data.roomId).emit('offer', data.offer);
    }

    //@UseGuards(WsGuard)
    @SubscribeMessage('answer')
    handleAnswer(@MessageBody() data: { answer: any, roomId: string }) {
        this.server.to(data.roomId).emit('answer', data.answer);
    }

    //@UseGuards(WsGuard)
    @SubscribeMessage('iceCandidate')
    handleIceCandidate(@MessageBody() data: { candidate: any, roomId: string }) {
        this.server.to(data.roomId).emit('iceCandidate', data.candidate);
    }
}
