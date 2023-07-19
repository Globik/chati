import { IsEmail, IsNotEmpty } from "class-validator";

export class SignInWithVkDto {
    @IsNotEmpty()
    username: string;

    @IsNotEmpty()
    firstname: string;

    @IsNotEmpty()
    lastname: string;

    @IsNotEmpty()
    gender: string;

    @IsNotEmpty()
    @IsEmail()
    email: string;
    
    @IsNotEmpty()
    vkontakteId: string;
}

export class getVKUser {
	@IsNotEmpty()
    vkurl: string;
    
    @IsNotEmpty()
    head: string;
    
     @IsNotEmpty()
    access_token: string;
    
    @IsNotEmpty()
    user_ids: number;
}
//  vi /root/chatroulette/chatroulette/src/auth/dto/signInWithVk.dto.ts
