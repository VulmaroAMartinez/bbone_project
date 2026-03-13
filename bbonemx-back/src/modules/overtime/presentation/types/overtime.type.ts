import { ObjectType, Field, ID } from '@nestjs/graphql';
import { ReasonForPayment } from 'src/common/enums/reason-for-payment.enum';
import { TechnicianType } from 'src/modules/catalogs/technicians/presentation/types';

@ObjectType('Overtime')
export class OvertimeType {
  @Field(() => ID)
  id: string;

  @Field()
  workDate: Date;

  @Field()
  startTime: string;

  @Field()
  endTime: string;

  @Field()
  workTime: string;

  @Field()
  activity: string;

  @Field(() => ReasonForPayment, { nullable: true })
  reasonForPayment?: ReasonForPayment;

  @Field(() => ID)
  technicianId: string;

  @Field(() => TechnicianType)
  technician: TechnicianType;

  @Field()
  isActive: boolean;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
