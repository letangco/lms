import mongoose from 'mongoose';
import { TIMEZONE_STATUS } from '../../constants';

/**
 * @swagger
 * definitions:
 *  Timezone:
 *    type: object
 *    properties:
 *      _id:
 *        type: string
 *      name:
 *        type: string
 *      value:
 *        type: string
 *      status:
 *        type: string
 */
const TimezoneSchema = new mongoose.Schema({
  name: { type: String, required: true, index: true },
  value: { type: String, unique: true },
  status: { type: String, enum: Object.values(TIMEZONE_STATUS), default: TIMEZONE_STATUS.ACTIVE, index: true },
}, {
  timestamps: true,
});

TimezoneSchema.set('toJSON', {
  transform(doc, ret, options) { // eslint-disable-line no-unused-vars
    delete ret.__v;
    delete ret.status;
    delete ret.createdAt;
    delete ret.updatedAt;
  },
});

export default mongoose.model('Timezone', TimezoneSchema);
