import mongoose from 'mongoose';
import { OrderStatus } from '@aj_tickets/common';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

interface OrderAttrs {
  id: string;
  version: number;
  userId: string;
  price: number;
  status: OrderStatus;
}

interface OrderDoc extends mongoose.Document {
  version: number;
  userId: string;
  price: number;
  status: OrderStatus;
}

interface OrderModel extends mongoose.Model<OrderDoc> {
  build(attrs: OrderAttrs): OrderDoc;
  findByEvent(event: { id: string, version: number }): Promise<OrderDoc | null>;
}

const orderSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    required: true
  }
});

orderSchema.set('versionKey', 'version');
orderSchema.plugin(updateIfCurrentPlugin);

orderSchema.set('toJSON', {
  transform(doc: any, ret: any) {
    ret.id = ret._id;
    delete ret._id;
  }
});

orderSchema.statics.findByEvent = (event: { id: string, version: number }) => {
  // Find the order with the given id and the *previous* version (version - 1).
  return Order.findOne({
    _id: event.id,
    version: event.version - 1
  });
};

orderSchema.statics.build = (attrs: OrderAttrs) => {
  return new Order({
    _id: attrs.id,
    version: attrs.version,
    userId: attrs.userId,
    price: attrs.price,
    status: attrs.status
  });
};

const Order = mongoose.model<OrderDoc, OrderModel>('Order', orderSchema);

export { Order };