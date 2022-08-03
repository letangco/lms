import mongoose from 'mongoose';
import { CATEGORY_STATUS } from '../../constants';

/**
 * @swagger
 * definitions:
 *  Category:
 *    type: object
 *    properties:
 *      _id:
 *        type: string
 *      name:
 *        type: string
 *      parent:
 *        type: string
 *      status:
 *        type: string
 */
const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true, index: true },
  parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  status: { type: String, enum: Object.values(CATEGORY_STATUS), default: CATEGORY_STATUS.ACTIVE },
}, {
  timestamps: true,
});

CategorySchema.set('toJSON', {
  transform(doc, ret, options) { // eslint-disable-line no-unused-vars
    delete ret.__v;
    delete ret.status;
    delete ret.createdAt;
    delete ret.updatedAt;
  },
});

export default mongoose.model('Category', CategorySchema);
