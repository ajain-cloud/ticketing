import mongoose from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current'
import { Order, OrderStatus } from './order';

interface TicketAttrs {
  id: string;
  title: string;
  price: number;
}

export interface TicketDoc extends mongoose.Document {
  title: string;
  price: number;
  version: number;
  isReserved(): Promise<boolean>;
}

interface TicketModel extends mongoose.Model<TicketDoc> {
  build(attrs: TicketAttrs): TicketDoc;
  findByEvent(event: { id: string, version: number }): Promise<TicketDoc | null>;
}

const ticketSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  }
});

ticketSchema.set('toJSON', {
  transform(doc: any, ret: any) {
    ret.id = ret._id;
    delete ret._id;
  }
});

ticketSchema.set('versionKey', 'version');
ticketSchema.plugin(updateIfCurrentPlugin);

// Implementing generic optimistic concurrency control (alternative to mongoose-update plugin)
// ticketSchema.pre('save', function () {
//   this.$where = {
//     version: this.get('version') - 1
//   };
// });

ticketSchema.statics.findByEvent = (event: { id: string, version: number }) => {
  // Find the ticket with the given id and the *previous* version (version - 1).
  // This enforces optimistic concurrency control: we only update if no other 
  // process has modified the ticket since the last known version.
  return Ticket.findOne({
    _id: event.id,
    version: event.version - 1
  });
};

ticketSchema.statics.build = (attrs: TicketAttrs) => {
  // Create a new Ticket mongoose document using the provided attributes.
  // - We explicitly set `_id` to match the event’s id (instead of letting Mongo generate one)
  //   so that the Ticket in our ticket service stays in sync with the ticket in order service.
  // - `title` and `price` come directly from the event data.
  return new Ticket({
    _id: attrs.id,
    title: attrs.title,
    price: attrs.price
  });
};

ticketSchema.methods.isReserved = async function () {
  // Run query to look at all orders. Find an order where 
  // the ticket is the ticket we just found *and* the orders status is *not* cancelled.
  // If we find an order from that means the ticket *is* reserved
  const existingOrder = await Order.findOne({
    ticket: this,
    status: {
      $in: [
        OrderStatus.Created,
        OrderStatus.AwaitingPayment,
        OrderStatus.Complete
      ]
    }
  });

  // Convert the value of existingOrder into a strict boolean.
  // - If existingOrder is defined/truthy → returns true
  // - If it’s null/undefined/falsey → returns false
  return !!existingOrder;
}

const Ticket = mongoose.model<TicketDoc, TicketModel>('Ticket', ticketSchema);

export { Ticket };