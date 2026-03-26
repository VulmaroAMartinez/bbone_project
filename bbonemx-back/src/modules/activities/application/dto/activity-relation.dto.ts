import { InputType, Field, ID } from '@nestjs/graphql';
import { IsNotEmpty, IsUUID, IsString } from 'class-validator';

@InputType()
export class AddActivityWorkOrderByFolioInput {
  @Field(() => ID)
  @IsNotEmpty({ message: 'El ID de la actividad es requerido' })
  @IsUUID()
  activityId: string;

  @Field()
  @IsNotEmpty({ message: 'El folio de la orden de trabajo es requerido' })
  @IsString()
  folio: string;
}

@InputType()
export class AddActivityMaterialRequestByFolioInput {
  @Field(() => ID)
  @IsNotEmpty({ message: 'El ID de la actividad es requerido' })
  @IsUUID()
  activityId: string;

  @Field()
  @IsNotEmpty({ message: 'El folio de la solicitud de material es requerido' })
  @IsString()
  folio: string;
}
