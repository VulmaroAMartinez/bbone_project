import { IsOptional, IsString } from 'class-validator';

/** Filtros alineados con MaterialRequestHistoryPage (search, status, category, area). */
export class MaterialRequestHistoryExportFiltersInput {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  area?: string;
}
