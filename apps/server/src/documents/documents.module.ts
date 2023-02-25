import { Module } from '@nestjs/common';
import { DocumentsGateway } from './documents.gateway';

@Module({
  providers: [DocumentsGateway],
})
export class DocumentsModule {}
