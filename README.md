# nestjs-pg-boss

This is a wrapper library for `pg-boss` that makes it easy to use within a NestJS application.

**This library is still in `alpha` stages at this point, but I would welcome any contributions and others testing it out to get a real version shipped!**

## Usage

**This library is not published to `npm` yet, so there's no way to install it yet.**

### Initializing the module in your `AppModule`

Initialize the `PgBossModule` in the root module of your application.

```ts
import { Module } from "@nestjs/common";
import { PgBossModule } from "this-library"

@Module({
  imports: [
    PgBossModule.forRoot({
      connectionString: "postgresql://pguser:pguser@localhost:5435/application",
    }),
  ],
})
export class AppModule {}
```

You can also inject anything you need to configure `PgBoss` using the `forRootAsync` method.

```ts
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { PgBossModule } from "this-library"

@Module({
  imports: [
    PgBossModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connectionString: configService.getOrThrow('DATABASE_URL')
      }),
    }),
  ],
})
export class AppModule {}
```

### Creating an PgBoss job

```ts
import { PgBoss } from 'this-library';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ExampleService {
  constructor(private readonly pgBoss: PgBoss) {}

  async sendEmail(email: string) {
    await this.pgBoss.send({
      name: 'send_email',
      data: {
        email,
        subject: 'Integration Test Email #1',
        body: 'This template is used by integration tests only.',
      },
    });
  }
}
```

### Working a job

You can easily configure "working" a job by using the `@Work` decorator. Make sure you've registered this class as a provider in your application and this handler will be automatically configured to handle the async tasks sent to it.

```ts
import { Injectable } from '@nestjs/common';
import { Work, WorkParams } from 'this-library';

type Data = {
  email: string;
  subject: string;
  body: string;
}

@Injectable()
export class EmailWorker {
  @Work("send_email")
  async sendEmailAsync({ data }: WorkParams<Data>) {
    const { email, subject, body } = data;

    console.log('Send email', email, subject, body);
  }
}
```

### Handling On Complete events

You can handle the `onComplete` events easily by importing the `OnComplete` decorator. The parameters here are not strongly typed yet. Make sure you've registered this class as a provider in your application.

```ts
import { Injectable } from '@nestjs/common';
import { OnComplete } from 'this-library';

@Injectable()
export class EmailAnalyticsWorker {
  @OnComplete("send_email")
  async recordEmailSent(results: any) {
    console.log('Email sent', results);
  }
}
```

### Scheduling Tasks

PgBoss allows you to setup cron scheduled tasks. I've made an "easy" to configure way to do that in this library as well.

When initializing the `PgBossModule`, you can pass in an array of "schedules".

```ts
import { Module } from "@nestjs/common";
import { PgBossModule } from "this-library"

@Module({
  imports: [
    PgBossModule.forRoot({
      connectionString: "postgresql://pguser:pguser@localhost:5435/application",
      schedules: [
        {
          name: 'start_bulk_email_send',
          cron: '0 8 * * *',
          data: {
            emailType: 'new_member',
          },
          options: {
            tz: 'America/New_York',
          }
        }
      ]
    }),
  ],
  providers: [BulkEmailSender]
})
export class AppModule {}
```

You'll also need a `@Work` decoratored method to listen for this event and perform the work. 

```ts
import { Injectable } from '@nestjs/common';
import { Work, WorkParams } from 'this-library';

type Params = {
  emailType: 'new_member';
}

@Injectable()
export class BulkEmailSender {
  constructor(
    private readonly pgBoss: PgBoss,
    private readonly usersService: UsersService
  ) {}

  @Work("start_bulk_email_send")
  async sendBulkEmails({ data }: WorkParams) {
    const { emailType } = data;

    const users = await this.usersService.getUsersReadyForEmailType(emailType);

    const events = users.map((user) => ({
      name: 'send_email',
      data: {
        email: user.email,
        subject: 'Welcome',
        body: 'So glad you\'re here',
      },
    }));

    await this.pgBoss.insert(events);
  }
}
```
