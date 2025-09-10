import { Message } from 'node-nats-streaming';
import { Listener } from './base-listener';
import { TicketCreatedEvent } from './ticket-created-event';
import { Subjects } from './subjects';

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  // Even though Subjects is an enum, we add the type annotation (Subjects.TicketCreated)
  // so TypeScript enforces that the `subject` variable can only ever be one of the enum values.
  // Without this, `subject` could be inferred as a plain string, and we’d lose type-safety.
  readonly subject: Subjects.TicketCreated = Subjects.TicketCreated;
  queueGroupName = 'payment-service';

  onMessage(data: TicketCreatedEvent['data'], msg: Message) {
    console.log('Event Data:', data);

    console.log(data.id);
    console.log(data.price);
    console.log(data.title);

    msg.ack();
  }
}