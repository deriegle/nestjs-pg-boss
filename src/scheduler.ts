import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import PgBoss, { Schedule } from "pg-boss";
import { OPTIONS_TYPE } from "./module-definition";

@Injectable()
export class PgBossScheduler implements OnModuleInit {
  private readonly logger = new Logger(PgBossScheduler.name);

  constructor(
    private readonly pgBoss: PgBoss,
    private readonly options: typeof OPTIONS_TYPE
  ) {}

  async onModuleInit() {
    const { schedules } = this.options;

    if (this.options.clearExistingSchedules) {
      await this.unscheduleExistingSchedules();
    }

    await this.initializeSchedules(schedules ?? []);
  }

  private async unscheduleExistingSchedules() {
    const currentSchedules = await this.pgBoss.getSchedules();

    await Promise.allSettled(
      currentSchedules.map((schedule) => this.pgBoss.unschedule(schedule.name))
    );

    this.logger.debug(
      `Unscheduled ${currentSchedules.length} existing schedules`
    );
  }

  private async initializeSchedules(schedules: Schedule[]) {
    await Promise.all(
      schedules.map(async (schedule) => {
        await this.pgBoss.schedule(
          schedule.name,
          schedule.cron,
          schedule.data,
          schedule.options
        );

        this.logger.debug(`Initialized ${schedule.name} for ${schedule.cron}`);
      })
    );
  }
}
