import { Global, Module } from '@nestjs/common';
import { PdfGeneratorService } from './pdf-generator.service';

@Global()
@Module({
  providers: [PdfGeneratorService],
  exports: [PdfGeneratorService],
})
export class PdfModule {}
