import { ConfigurableModuleBuilder } from "@nestjs/common";
import PgBoss, { Schedule } from "pg-boss";

type Options = PgBoss.ConstructorOptions & {
  schedules?: Schedule[];
  clearExistingSchedules?: boolean;
};

export const { OPTIONS_TYPE, ASYNC_OPTIONS_TYPE, MODULE_OPTIONS_TOKEN } =
  new ConfigurableModuleBuilder<Options>()
    .setClassMethodName("forRoot")
    .build();
