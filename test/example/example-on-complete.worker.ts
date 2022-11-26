import { Injectable } from "@nestjs/common";
import { OnComplete } from "../../src";

@Injectable()
export class ExampleOnCompleteWorker {
  @OnComplete("send_email")
  async onEmailSendComplete(job: any) {
    console.log(`Job ${job.id} completed.`);
    return job;
  }
}
