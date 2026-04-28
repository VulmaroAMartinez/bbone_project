import { InputType, Field, PartialType, ID, Float } from '@nestjs/graphql';
import {
  IsNotEmpty,
  IsString,
  MaxLength,
  IsOptional,
  IsUUID,
  IsNumber,
  Min,
  ValidateIf,
} from 'class-validator';

@InputType()
export class CreateSparePartInput {
  @Field(() => ID, {
    nullable: true,
    description:
      'Opcional. Si se omite, la refacción no queda ligada a un equipo.',
  })
  @ValidateIf((_o, v) => v != null && String(v).trim() !== '')
  @IsUUID()
  machineId?: string;

  @Field()
  @IsNotEmpty({ message: 'El número de parte es requerido' })
  @IsString()
  @MaxLength(100)
  partNumber: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  sku?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  brand?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  model?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  supplier?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  unitOfMeasure?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'La cantidad no puede ser negativa' })
  cantidad?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'El costo no puede ser negativo' })
  costo?: number;
}

@InputType()
export class UpdateSparePartInput extends PartialType(CreateSparePartInput) {}
