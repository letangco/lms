import mongoose from 'mongoose';
import { GROUP_STATUS } from '../../constants';
import { makeId } from '../../helpers/string.helper';

/**
 * @swagger
 * definitions:
 *  Group:
 *    type: object
 *    properties:
 *      _id:
 *        type: string
 *      name:
 *        type: string
 *      description:
 *        type: string
 *      key:
 *        type: string
 *      price:
 *        type: number
 *      status:
 *        type: string
 */
const GroupSchema = new mongoose.Schema({
  name: { type: String, required: true, max: 100, index: true },
  description: { type: String, max: 1000 },
  key: {
    type: String,
    required: true,
    default: () => makeId(10),
    max: 20,
    index: true
  },
  price: { type: Number },
  status: { type: String, enum: Object.values(GROUP_STATUS), default: GROUP_STATUS.ACTIVE, index: true },
}, {
  timestamps: true,
});

GroupSchema.set('toJSON', {
  transform(doc, ret, options) { // eslint-disable-line no-unused-vars
    delete ret.__v;
    delete ret.status;
    delete ret.createdAt;
    delete ret.updatedAt;
  },
});

export default mongoose.model('Group', GroupSchema);
