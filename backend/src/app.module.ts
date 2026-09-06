import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { AchievementsModule } from './achievements/achievements.module.js';
import { ActivitiesModule } from './activities/activities.module.js';
import { AnalyticsModule } from './analytics/analytics.module.js';
import { AuthModule } from './auth/auth.module.js';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard.js';
import { DayItemsModule } from './day-items/day-items.module.js';
import { DocumentsModule } from './documents/documents.module.js';
import { FinanceModule } from './finance/finance.module.js';
import { GoalsModule } from './goals/goals.module.js';
import { GoogleModule } from './google/google.module.js';
import { HabitsModule } from './habits/habits.module.js';
import { JournalModule } from './journal/journal.module.js';
import { KnowledgeModule } from './knowledge/knowledge.module.js';
import { LifeAreasModule } from './life-areas/life-areas.module.js';
import { PersonalYearsModule } from './personal-years/personal-years.module.js';
import { ReviewsModule } from './reviews/reviews.module.js';
import { SearchModule } from './search/search.module.js';
import { SyncModule } from './sync/sync.module.js';
import { TasksModule } from './tasks/tasks.module.js';
import { TodayModule } from './today/today.module.js';
import { PlanModule } from './plan/plan.module.js';
import { UsersModule } from './users/users.module.js';
import { HealthController } from './health.controller.js';

@Module({
  controllers: [HealthController],
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.getOrThrow<string>('MONGODB_URI'),
      }),
    }),
    UsersModule,
    AuthModule,
    LifeAreasModule,
    PersonalYearsModule,
    HabitsModule,
    ActivitiesModule,
    DayItemsModule,
    GoalsModule,
    TasksModule,
    KnowledgeModule,
    DocumentsModule,
    JournalModule,
    ReviewsModule,
    AnalyticsModule,
    AchievementsModule,
    SearchModule,
    SyncModule,
    GoogleModule,
    TodayModule,
    PlanModule,
    FinanceModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: JwtAuthGuard }],
})
export class AppModule {}
