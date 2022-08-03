import mongoose from 'mongoose';
import { LANGUAGE_STATUS } from '../../constants';

/**
 * @swagger
 * definitions:
 *  Language:
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
const LanguageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  value: { type: String, unique: true },
  status: { type: String, enum: Object.values(LANGUAGE_STATUS), default: LANGUAGE_STATUS.ACTIVE },
}, {
  timestamps: true,
});

LanguageSchema.set('toJSON', {
  transform(doc, ret, options) { // eslint-disable-line no-unused-vars
    delete ret.__v;
    delete ret.createdAt;
    delete ret.updatedAt;
    delete ret.status;
  },
});

export default mongoose.model('Language', LanguageSchema);
