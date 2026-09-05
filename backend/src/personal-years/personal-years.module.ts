import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PersonalYear, PersonalYearSchema } from './schemas/personal-year.schema.js';
import { PersonalYearsController } from './personal-years.controller.js';
import { PersonalYearsService } from './personal-years.service.js';

@Module({
  imports: [MongooseModule.forFeature([{ name: PersonalYear.name, schema: PersonalYearSchema }])],
  controllers: [PersonalYearsController],
  providers: [PersonalYearsService],
  exports: [PersonalYearsService],
})
export class PersonalYearsModule {}
