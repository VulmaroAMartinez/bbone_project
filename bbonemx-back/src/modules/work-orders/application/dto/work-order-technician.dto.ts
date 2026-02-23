import { InputType, Field, ID } from '@nestjs/graphql';
import { IsNotEmpty, IsUUID, IsBoolean, IsOptional } from 'class-validator';

@InputType()
export class AssignTechnicianInput {
  @Field(() => ID)
  @IsNotEmpty()
  @IsUUID()
  workOrderId: string;

  @Field(() => ID)
  @IsNotEmpty()
  @IsUUID()
  technicianId: string;

  @Field({ defaultValue: false })
  @IsOptional()
  @IsBoolean()
  isLead?: boolean;
}

@InputType()
export class UpdateTechnicianAssignmentInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isLead?: boolean;
}
