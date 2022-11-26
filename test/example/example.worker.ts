import { Injectable } from "@nestjs/common";
import { BatchedWorkParams, Work } from "../../src";

@Injectable()
export class ExampleWorker {
  @Work("send_email", {
    batchSize: 1,
  })
  async work(batched: BatchedWorkParams) {
    console.log(`Received ${batched.length}`);

    for (const job of batched) {
      console.log(job);
    }

    return batched;
  }
}
