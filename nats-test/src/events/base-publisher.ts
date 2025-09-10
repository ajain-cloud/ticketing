import { Stan } from 'node-nats-streaming';
import { Subjects } from './subjects';

interface Event {
  subject: Subjects;
  data: any;
}

export abstract class Publisher<T extends Event> {
  abstract subject: T['subject'];
  private client: Stan

  constructor(client: Stan) {
    this.client = client;
  }

  publish(data: T['data']): Promise<void> {
    // We wrap the NATS client.publish call in a Promise so we can use async/await in main publisher.ts.
    // - client.publish is callback-based, so we convert it to a Promise-based API.
    // - If publish fails (err), we reject the Promise so the caller can handle the error.
    // - If it succeeds, we resolve() to let the caller know the message was published.
    return new Promise((resolve, reject) => {
      this.client.publish(this.subject, JSON.stringify(data), (err) => {
        if (err) {
          return reject(err);
        }

        console.log('Event published to subject', this.subject);
        resolve();
      });
    });
  }
} 