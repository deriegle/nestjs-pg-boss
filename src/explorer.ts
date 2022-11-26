import PgBoss from "pg-boss";
import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { DiscoveryService, MetadataScanner, ModuleRef } from "@nestjs/core";
import { PgBossMetadataAccessor } from "./metadata.accessor";
import { WorkDecoratorOptions } from "./decorators/work.decorator";
import { OnCompleteDecoratorOptions } from "./decorators/on-complete.decorator";

@Injectable()
export class PgBossExplorer implements OnModuleInit {
  private readonly logger = new Logger(PgBossExplorer.name);

  constructor(
    private readonly moduleRef: ModuleRef,
    private readonly discoveryService: DiscoveryService,
    private readonly metadataAccessor: PgBossMetadataAccessor,
    private readonly metadataScanner: MetadataScanner
  ) {}

  async onModuleInit() {
    await this.explore();
  }

  async explore() {
    const pgBoss = this.moduleRef.get<PgBoss>(PgBoss);

    await this.initializeProvider(pgBoss);
  }

  private async initializeProvider(pgBoss: PgBoss) {
    const providers = this.discoveryService
      .getProviders()
      .filter((provider) => !!provider.instance);

    const promises = providers.map(async ({ instance, name }) =>
      this.metadataScanner.scanFromPrototype(
        instance,
        Object.getPrototypeOf(instance),
        async (key) => {
          if (this.metadataAccessor.isWorkerFunction(instance[key])) {
            const workerOptions =
              this.metadataAccessor.getWorkerFunctionOptions(instance[key]);

            if (!workerOptions) {
              return;
            }

            await this.handleWork(instance, key, workerOptions, pgBoss);

            this.logger.debug(`[${workerOptions.name}]: ${name}.${key}`);
          } else if (
            this.metadataAccessor.isOnCompleteFunction(instance[key])
          ) {
            const onCompleteOptions =
              this.metadataAccessor.getOnCompleteFunctionOptions(instance[key]);

            if (!onCompleteOptions) {
              return;
            }

            await this.handleOnComplete(
              instance,
              key,
              onCompleteOptions,
              pgBoss
            );

            this.logger.debug(
              `[${onCompleteOptions.name}][onComplete]: ${name}.${key}`
            );
          }
        }
      )
    );

    await Promise.allSettled(promises);
  }

  private async handleWork(
    instance: any,
    key: string,
    options: WorkDecoratorOptions,
    pgBoss: PgBoss
  ) {
    await pgBoss.work(options.name, options.options ?? {}, async (job) => {
      await instance[key].apply(instance, [job]);
    });
  }

  private async handleOnComplete(
    instance: any,
    key: string,
    options: OnCompleteDecoratorOptions,
    pgBoss: PgBoss
  ) {
    await pgBoss.onComplete(
      options.name,
      { batchSize: 1 },
      async (job: any) => {
        await instance[key].apply(instance, [job]);
      }
    );
  }
}
