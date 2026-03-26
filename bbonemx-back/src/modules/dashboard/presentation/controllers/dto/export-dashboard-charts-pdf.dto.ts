import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  ValidateNested,
} from 'class-validator';

export class DashboardChartPdfItemDto {
  @IsString()
  @MaxLength(200)
  title!: string;

  @IsString()
  @MaxLength(2_000_000)
  @Matches(/^data:image\/(png|jpeg);base64,/i)
  imageDataUrl!: string;
}

export class ExportDashboardChartsPdfBodyDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  documentTitle?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  subtitle?: string;

  @IsOptional()
  @IsString()
  @MaxLength(240)
  filename?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(12)
  @ValidateNested({ each: true })
  @Type(() => DashboardChartPdfItemDto)
  items!: DashboardChartPdfItemDto[];
}
