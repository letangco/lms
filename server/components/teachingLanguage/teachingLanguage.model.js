import mongoose from 'mongoose';
import { TEACHING_LANGUAGE_STATUS } from '../../constants';

/**
 * @swagger
 * definitions:
 *  TeachingLanguage:
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
const TeachingLanguageSchema = new mongoose.Schema({
  name: { type: String, required: true, index: true },
  value: { type: String, unique: true },
  status: { type: String, enum: Object.values(TEACHING_LANGUAGE_STATUS), default: TEACHING_LANGUAGE_STATUS.ACTIVE, index: true },
}, {
  timestamps: true,
});

TeachingLanguageSchema.set('toJSON', {
  transform(doc, ret, options) { // eslint-disable-line no-unused-vars
    delete ret.__v;
    delete ret.createdAt;
    delete ret.updatedAt;
    delete ret.status;
  },
});

export default mongoose.model('TeachingLanguage', TeachingLanguageSchema);
