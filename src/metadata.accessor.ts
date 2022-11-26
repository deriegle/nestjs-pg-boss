import { Injectable, Type } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { PG_BOSS_MODULE_ON_COMPLETE, PG_BOSS_MODULE_WORK } from "./constants";
import { OnCompleteDecoratorOptions } from "./decorators/on-complete.decorator";
import { WorkDecoratorOptions } from "./decorators/work.decorator";

@Injectable()
export class PgBossMetadataAccessor {
  constructor(private readonly reflector: Reflector) {}

  isWorkerFunction(target: Type<unknown>): boolean {
    return !!this.getWorkerFunctionOptions(target);
  }

  isOnCompleteFunction(target: Type<unknown>) {
    return !!this.getOnCompleteFunctionOptions(target);
  }

  getWorkerFunctionOptions(
    target: Type<unknown>
  ): WorkDecoratorOptions | undefined {
    return this.reflector.get(PG_BOSS_MODULE_WORK, target);
  }

  getOnCompleteFunctionOptions(
    target: Type<unknown>
  ): OnCompleteDecoratorOptions | undefined {
    return this.reflector.get(PG_BOSS_MODULE_ON_COMPLETE, target);
  }
}
