import { Module } from "@nestjs/common";
import { PgBossModule } from "../../src/module";
import { ExampleOnCompleteWorker } from "./example-on-complete.worker";
import { ExampleController } from "./example.controller";
import { ExampleWorker } from "./example.worker";

@Module({
  imports: [
    PgBossModule.forRoot({
      connectionString: "postgresql://pguser:pguser@localhost:5435/application",
      onComplete: true,
      noScheduling: false,
      schedules: [
        {
          name: "send_email",
          cron: "* 18 * * *",
          data: {
            email: "scheduled@example.com",
            subject: "I was scheduled for 7PM",
          },
          options: {
            tz: "America/New_York",
          },
        },
      ],
    }),
  ],
  controllers: [ExampleController],
  providers: [ExampleWorker, ExampleOnCompleteWorker],
})
export class ExampleModule {}
