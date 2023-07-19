import { IsNotEmpty } from "class-validator";

export class FindNewRoomDto {
    @IsNotEmpty()
    gender: string;

    @IsNotEmpty()
    country: number;

    @IsNotEmpty()
    userId: string;
    
     @IsNotEmpty()
    countries: [];
     @IsNotEmpty()
    nick: string;
    
     @IsNotEmpty()
    mygender: string;
    
    
     @IsNotEmpty()
    suechgender: string;
    
     @IsNotEmpty()
    flag: string;
}
// vi src/gateways/room-gateway/dto/findNewRoom.dto.ts
