import mongoose from 'mongoose';
import request from 'supertest';
import { OrderStatus } from '@aj_tickets/common';
import { app } from '../../app';
import { Order } from '../../models/order';
import { stripe } from '../../stripe';
import { Payment } from '../../models/payment';

// This is the test implementation for stripe mock function  
// jest.mock('../../stripe');

it('returns 404 when purchasing an order that does not exist', async () => {
  await request(app)
    .post('/api/payments')
    .set('Cookie', signin())
    .send({
      token: 'adsaasdsa',
      orderId: new mongoose.Types.ObjectId().toHexString()
    })
    .expect(404)
});

it('returns 401 when purchasing an order that does not belong to the user', async () => {
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    userId: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    status: OrderStatus.Created,
    price: 100
  });
  await order.save();

  await request(app)
    .post('/api/payments')
    .set('Cookie', signin())
    .send({
      token: 'adsaasdsa',
      orderId: order.id
    })
    .expect(401)
});

it('returns 400 when purchasing a cancelled order', async () => {
  const userId = new mongoose.Types.ObjectId().toHexString();

  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    userId,
    version: 0,
    status: OrderStatus.Cancelled,
    price: 100
  });
  await order.save();

  await request(app)
    .post('/api/payments')
    .set('Cookie', signin(userId))
    .send({
      orderId: order.id,
      token: 'asdf'
    })
    .expect(400);
});

// This is the test implementation for stripe mock function
// it('returns a 201 with valid inputs', async () => {
//   const userId = new mongoose.Types.ObjectId().toHexString();

//   const order = Order.build({
//     id: new mongoose.Types.ObjectId().toHexString(),
//     userId,
//     version: 0,
//     status: OrderStatus.Created,
//     price: 100
//   });
//   await order.save();

//   await request(app)
//     .post('/api/payments')
//     .set('Cookie', signin(userId))
//     .send({
//       token: 'tok_visa',
//       orderId: order.id
//     })
//     .expect(201)

//   const chargeOptions = (stripe.charges.create as jest.Mock).mock.calls[0][0];
//   expect(chargeOptions.source).toEqual('tok_visa');
//   expect(chargeOptions.amount).toEqual(100 * 100);
//   expect(chargeOptions.currency).toEqual('usd');
// });

// This is the test implementation with stripe api call
it('returns a 201 with valid inputs', async () => {
  const userId = new mongoose.Types.ObjectId().toHexString();
  const price = Math.floor(Math.random() * 100000);

  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    userId,
    version: 0,
    status: OrderStatus.Created,
    price
  });
  await order.save();

  await request(app)
    .post('/api/payments')
    .set('Cookie', signin(userId))
    .send({
      token: 'tok_visa',
      orderId: order.id
    })
    .expect(201)

  const stripeCharges = await stripe.charges.list({ limit: 50 });
  const stripeCharge = stripeCharges.data.find(charge => {
    return charge.amount === price * 100;
  });

  expect(stripeCharge).toBeDefined();
  expect(stripeCharge!.currency).toEqual('usd');

  const payment = await Payment.findOne({
    orderId: order.id,
    stripeId: stripeCharge!.id
  });
  expect(payment).not.toBeNull();
});