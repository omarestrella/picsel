import { Module } from '@nestjs/common';
import { DocumentsController } from './documents.controller';
import { DocumentsGateway } from './documents.gateway';
import { DocumentsService } from './documents.service';

@Module({
  providers: [DocumentsGateway, DocumentsService],
  controllers: [DocumentsController],
  exports: [DocumentsService],
})
export class DocumentsModule {}
