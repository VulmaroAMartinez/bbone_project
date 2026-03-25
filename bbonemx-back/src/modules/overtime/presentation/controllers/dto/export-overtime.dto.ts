import { Type } from 'class-transformer';
import { IsEnum, IsOptional, IsString, ValidateNested } from 'class-validator';
import { ReasonForPayment } from 'src/common/enums/reason-for-payment.enum';

export class OvertimeExportFiltersDto {
  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;

  @IsOptional()
  @IsString()
  technicianId?: string;

  @IsOptional()
  @IsString()
  positionId?: string;

  @IsOptional()
  @IsEnum(ReasonForPayment)
  reasonForPayment?: ReasonForPayment;
}

export class ExportOvertimeBodyDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => OvertimeExportFiltersDto)
  filters?: OvertimeExportFiltersDto;

  @IsOptional()
  @IsString()
  filename?: string;

  @IsOptional()
  @IsString()
  periodFrom?: string;

  @IsOptional()
  @IsString()
  periodTo?: string;
}

