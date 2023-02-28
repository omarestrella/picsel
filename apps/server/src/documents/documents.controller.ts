import { Controller, Get, Param, StreamableFile } from '@nestjs/common';
import { DocumentsService } from './documents.service';

@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get('/:id')
  async getDocument(@Param('id') documentID: string): Promise<StreamableFile> {
    const documentData = await this.documentsService.getDocumentData(
      documentID,
    );
    return new StreamableFile(documentData);
  }
}
