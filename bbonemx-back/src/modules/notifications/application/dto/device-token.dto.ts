import { InputType, Field, ID} from "@nestjs/graphql";
import { IsNotEmpty, IsString, IsUUID, IsOptional, IsEnum } from "class-validator";
import { DevicePlatform } from "src/common";

@InputType()
export class RegisterDeviceTokenInput {
    @Field({description: 'El token de dispositivo'})
    @IsNotEmpty()
    @IsString()
    fcmToken: string;

    @Field(() => DevicePlatform, { defaultValue: DevicePlatform.WEB, description: 'La plataforma del dispositivo'})
    @IsEnum(DevicePlatform)
    platform: DevicePlatform;

    @Field({ nullable: true, description: 'El nombre del dispositivo'})
    @IsOptional()
    @IsString()
    deviceName?: string;


}

@InputType()
export class UnregisterDeviceTokenInput {
    @Field({description: 'El token de dispositivo'})
    @IsNotEmpty()
    @IsString()
    fcmToken: string;
}