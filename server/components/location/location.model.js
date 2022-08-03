import mongoose from 'mongoose';
import { LOCATION_STATUS } from '../../constants';

/**
 * @swagger
 * definitions:
 *  Location:
 *    type: object
 *    properties:
 *      _id:
 *        type: string
 *      name:
 *        type: string
 *      description:
 *        type: string
 *      capacity:
 *        type: number
 *      status:
 *        type: string
 */
const LocationSchema = new mongoose.Schema({
  name: { type: String, required: true, index: true },
  description: { type: String },
  capacity: { type: 'Number' },
  status: { type: String, enum: Object.values(LOCATION_STATUS), default: LOCATION_STATUS.ACTIVE, index: true },
}, {
  timestamps: true,
});

LocationSchema.set('toJSON', {
  transform(doc, ret, options) { // eslint-disable-line no-unused-vars
    delete ret.__v;
    delete ret.status;
    delete ret.createdAt;
    delete ret.updatedAt;
  },
});

export default mongoose.model('Location', LocationSchema);
