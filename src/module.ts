import PgBoss from "pg-boss";
import { DynamicModule, Module, OnModuleDestroy } from "@nestjs/common";
import {
  ASYNC_OPTIONS_TYPE,
  MODULE_OPTIONS_TOKEN,
  OPTIONS_TYPE,
} from "./module-definition";
import { DiscoveryModule } from "@nestjs/core";
import { PgBossExplorer } from "./explorer";
import { PgBossMetadataAccessor } from "./metadata.accessor";
import { PgBossScheduler } from "./scheduler";

@Module({})
export class PgBossModule implements OnModuleDestroy {
  constructor(private readonly pgBoss: PgBoss) {}

  async onModuleDestroy() {
    await this.pgBoss.stop({ graceful: true });
  }

  static forRoot({
    clearExistingSchedules = true,
    ...rest
  }: typeof OPTIONS_TYPE): DynamicModule {
    const options = {
      ...rest,
      clearExistingSchedules,
    };

    return {
      module: PgBossModule,
      global: true,
      imports: [DiscoveryModule],
      providers: [
        PgBossExplorer,
        PgBossMetadataAccessor,
        {
          provide: PgBossScheduler,
          inject: [PgBoss],
          useFactory: (pgBoss: PgBoss) => new PgBossScheduler(pgBoss, options),
        },
        {
          provide: PgBoss,
          useFactory: async () => new PgBoss(options).start(),
        },
      ],
      exports: [PgBoss],
    };
  }

  static forRootAsync(asyncOptions: typeof ASYNC_OPTIONS_TYPE): DynamicModule {
    return {
      module: PgBossModule,
      global: true,
      imports: [DiscoveryModule],
      providers: [
        PgBossExplorer,
        PgBossMetadataAccessor,
        {
          provide: PgBossScheduler,
          inject: [PgBoss, MODULE_OPTIONS_TOKEN],
          useFactory: (
            pgBoss: PgBoss,
            { clearExistingSchedules = true, ...rest }: typeof OPTIONS_TYPE
          ) =>
            new PgBossScheduler(pgBoss, {
              ...rest,
              clearExistingSchedules,
            }),
        },
        {
          provide: MODULE_OPTIONS_TOKEN,
          ...(asyncOptions as any),
        },
        {
          provide: PgBoss,
          inject: [MODULE_OPTIONS_TOKEN],
          useFactory: async (options: typeof OPTIONS_TYPE) =>
            new PgBoss(options).start(),
        },
      ],
      exports: [PgBoss],
    };
  }
}
