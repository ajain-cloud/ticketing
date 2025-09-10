import mongoose from 'mongoose';
import { Password } from '../services/passwords';

// An interface that describes the properties that are required to create a new user
interface UserAttrs {
  email: string,
  password: string
}

// An interface that describes the properties that a User Model has
interface UserModel extends mongoose.Model<UserDoc> {
  build(attrs: UserAttrs): UserDoc;
}

// An interface that describes the properties that a user document has
interface UserDoc extends mongoose.Document {
  email: string,
  password: string
}

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  }
});

// Customize JSON output: replace "_id" with "id" and only expose safe fields (id, email)
// This ensures sensitive fields (like password, __v, etc.) are not sent in API responses
userSchema.set('toJSON', {
  transform(doc: any, ret: any) {
    const { _id, email } = ret;
    return { id: _id, email };
  }
});

userSchema.pre('save', async function (done) {
  if (this.isModified('password')) {
    const hashed = await Password.toHash(this.get('password'));
    this.set('password', hashed);
  }
  done();
});

userSchema.statics.build = (attrs: UserAttrs) => {
  return new User(attrs);
};

const User = mongoose.model<UserDoc, UserModel>('User', userSchema);

export { User };