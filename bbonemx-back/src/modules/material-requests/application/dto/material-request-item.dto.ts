import { InputType, Field, ID, PartialType, Int } from '@nestjs/graphql';
import {
  IsNotEmpty,
  IsString,
  IsUUID,
  IsOptional,
  IsInt,
  IsPositive,
  Min,
} from 'class-validator';

@InputType()
export class CreateMaterialRequestItemInput {
  /**
   * Only required for the standalone addMaterialToRequest mutation.
   * Omit when embedding items inside CreateMaterialRequestInput.
   */
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  materialRequestId?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  materialId?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  sparePartId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  customName?: string;

  /** Populated manually only when no catalog ID is provided. */
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  sku?: string;

  /** Required when RequestCategory is REQUEST_SKU_MATERIAL or REQUEST_SKU_SPARE_PART. */
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  partNumber?: string;

  /** Required when RequestCategory is REQUEST_SKU_MATERIAL or REQUEST_SKU_SPARE_PART. */
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  brand?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  model?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @IsPositive()
  requestedQuantity?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  unitOfMeasure?: string;

  /**
   * Required when RequestCategory is REQUEST_SKU_MATERIAL or REQUEST_SKU_SPARE_PART.
   * Must be greater than proposedMinStock.
   */
  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  proposedMaxStock?: number;

  /**
   * Required when RequestCategory is REQUEST_SKU_MATERIAL or REQUEST_SKU_SPARE_PART.
   * Must be >= 0.
   */
  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  proposedMinStock?: number;
}

@InputType()
export class UpdateMaterialRequestItemInput extends PartialType(
  CreateMaterialRequestItemInput,
) {
  @Field(() => ID)
  @IsNotEmpty({
    message: 'El ID del item de solicitud de material es requerido',
  })
  @IsUUID()
  id: string;
}
