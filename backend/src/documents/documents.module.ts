import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GoogleModule } from '../google/google.module.js';
import { DocumentRecord, DocumentRecordSchema } from './schemas/document-record.schema.js';
import { DocumentsController } from './documents.controller.js';
import { DocumentsService } from './documents.service.js';

@Module({
  imports: [
    GoogleModule,
    MongooseModule.forFeature([{ name: DocumentRecord.name, schema: DocumentRecordSchema }]),
  ],
  controllers: [DocumentsController],
  providers: [DocumentsService],
  exports: [DocumentsService],
})
export class DocumentsModule {}
