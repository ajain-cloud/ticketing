import { Message } from 'node-nats-streaming';
import { Subjects, Listener, OrderCancelledEvent } from '@aj_tickets/common';
import { queueGroupName } from './queue-group-name';
import { Ticket } from '../../models/ticket';
import { TicketUpdatedPublisher } from '../publisher/ticket-updated-publisher';

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  readonly subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
    // Find the ticket the order is reserving
    const ticket = await Ticket.findById(data.ticket.id);

    // If no ticket, throw error
    if (!ticket) {
      throw new Error('Ticket not found');
    }

    // Mark the ticket as being unreserved by setting its orderId property on the ticket as undefined
    ticket.set({ orderId: undefined });

    // Save the ticket
    await ticket.save();

    // Publish a TicketUpdated event after persisting changes, so other services
    // stay in sync with the latest ticket state (used for cross-service consistency).
    // Here we need to publish the event so ticket version stored in order service is in
    // sync with ticket version in ticket service 
    await new TicketUpdatedPublisher(this.client).publish({
      id: ticket.id,
      version: ticket.version,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
      orderId: ticket.orderId
    });

    // acknowledge the message
    msg.ack();
  }
}