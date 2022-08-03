import mongoose from 'mongoose';
/**
 * @swagger
 * definitions:
 *  User Login:
 *    type: object
 *    properties:
 *      _id:
 *        type: string
 *      times:
 *        type: number
 */
const UserLoginSchema = new mongoose.Schema({
  times: { type: Number, default: 1, index: true },
  completed: { type: Number, default: 0, index: true },
  date: { type: Date }
});

UserLoginSchema.set('toJSON', {
  transform(doc, ret, options) { // eslint-disable-line no-unused-vars
    delete ret.__v;
    delete ret._id;
  },
});
export default mongoose.model('UserLogin', UserLoginSchema);
