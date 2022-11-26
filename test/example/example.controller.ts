import { PgBoss } from "../../src";
import { Controller, Post } from "@nestjs/common";

@Controller("/api/example")
export class ExampleController {
  constructor(private readonly pgBoss: PgBoss) {}

  @Post()
  async createJob() {
    await this.pgBoss.send({
      name: "send_email",
      data: {
        email: "test@example.com",
        subject: "Hello, world!",
      },
    });
  }
}
