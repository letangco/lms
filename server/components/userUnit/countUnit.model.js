import mongoose from 'mongoose';
/**
 * @swagger
 * definitions:
 *  Course Detail:
 *    type: object
 *    properties:
 *      _id:
 *        type: string
 *      unit:
 *        type: string
 *      user:
 *        type: string
 *      count:
 *        type: number
 */
const CountUnitSchema = new mongoose.Schema({
  unit: { type: mongoose.Schema.Types.ObjectId, ref: 'Unit', index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  count: { type: Number },
  start_time: { type: Date },
  end_time: { type: Date },
}, {
  timestamps: true,
});
CountUnitSchema.set('toJSON', {
  transform(doc, ret, options) { // eslint-disable-line no-unused-vars
    delete ret.__v;
    delete ret.createdAt;
    delete ret.updatedAt;
  },
});

export default mongoose.model('CountUnit', CountUnitSchema);
