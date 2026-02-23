import { InputType, Field } from '@nestjs/graphql';
import { IsOptional, IsBoolean, IsEnum, Matches } from 'class-validator';
import { NotificationType } from 'src/common';

@InputType()
export class UpdateNotificationPreferenceInput {
    @Field(() => NotificationType, { description: 'Tipo de notificación' })
    @IsEnum(NotificationType)
    notificationType: NotificationType;

    @Field({ nullable: true, description: 'Habilitar push para este tipo' })
    @IsOptional()
    @IsBoolean()
    pushEnabled?: boolean;

    @Field({ nullable: true, description: 'Habilitar email para este tipo' })
    @IsOptional()
    @IsBoolean()
    emailEnabled?: boolean;

    @Field({ nullable: true, description: 'Inicio de horario silencioso (HH:mm)' })
    @IsOptional()
    @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, { message: 'Formato HH:mm requerido' })
    quietHoursStart?: string;

    @Field({ nullable: true, description: 'Fin de horario silencioso (HH:mm)' })
    @IsOptional()
    @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, { message: 'Formato HH:mm requerido' })
    quietHoursEnd?: string;
}

@InputType()
export class BulkUpdatePreferencesInput {
    @Field(() => [UpdateNotificationPreferenceInput])
    preferences: UpdateNotificationPreferenceInput[];
}
