import { SetMetadata } from "@nestjs/common";
import { PG_BOSS_MODULE_WORK } from "../constants";
import type { JobWithDoneCallback, WorkOptions } from "pg-boss";

export type WorkDecoratorOptions = {
  name: string;
  options?: WorkOptions;
};

export type WorkParams<Data = any> = JobWithDoneCallback<Data, any>;
export type BatchedWorkParams<Data = any> = JobWithDoneCallback<Data, any>[];

type Target<Property extends string> = {
  [property in Property]: (data: WorkParams) => Promise<any>;
};

type BatchedTarget<Property extends string> = {
  [property in Property]: (data: BatchedWorkParams) => Promise<any>;
};

type BaseTarget = { [s in string]: any };

type WorkMethod<Options extends WorkOptions> = <
  PropertyKey extends string,
  T extends BaseTarget
>(
  target: Options["batchSize"] extends number
    ? T[PropertyKey] extends BatchedTarget<PropertyKey>
      ? BatchedTarget<PropertyKey>
      : "Use the BatchedWorkParams type for your @Work function parameter"
    : Target<PropertyKey>,
  propertyKey: PropertyKey,
  descriptor: PropertyDescriptor
) => void;

export function Work<Options extends WorkOptions>(
  name: string,
  options?: Options
): WorkMethod<Options> {
  return function (target, propertyKey, descriptor) {
    SetMetadata<typeof PG_BOSS_MODULE_WORK, WorkDecoratorOptions>(
      PG_BOSS_MODULE_WORK,
      {
        name,
        options,
      }
    )(target, propertyKey, descriptor);
  };
}
