import { SetMetadata } from "@nestjs/common";
import { PG_BOSS_MODULE_ON_COMPLETE } from "../constants";

export type OnCompleteDecoratorOptions = {
  name: string;
};

export function OnComplete(name: string) {
  return SetMetadata<
    typeof PG_BOSS_MODULE_ON_COMPLETE,
    OnCompleteDecoratorOptions
  >(PG_BOSS_MODULE_ON_COMPLETE, {
    name,
  });
}
