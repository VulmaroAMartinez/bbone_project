import { Global, Module } from '@nestjs/common';
import { ExcelGeneratorService } from './excel-generator.service';

@Global()
@Module({
  providers: [ExcelGeneratorService],
  exports: [ExcelGeneratorService],
})
export class ExcelModule {}
