import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LifeArea, LifeAreaSchema } from './schemas/life-area.schema.js';
import { LifeAreasController } from './life-areas.controller.js';
import { LifeAreasService } from './life-areas.service.js';

@Module({
  imports: [MongooseModule.forFeature([{ name: LifeArea.name, schema: LifeAreaSchema }])],
  controllers: [LifeAreasController],
  providers: [LifeAreasService],
  exports: [LifeAreasService, MongooseModule],
})
export class LifeAreasModule {}
