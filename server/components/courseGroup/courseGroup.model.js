import mongoose from 'mongoose';
import { GROUP_STATUS } from '../../constants';
/**
 * @swagger
 * definitions:
 *  Course Group:
 *    type: object
 *    properties:
 *      _id:
 *        type: string
 *      name:
 *        type: string
 *      description:
 *        type: string
 *      course:
 *        type: string
 *      key:
 *        type: string
 *      status:
 *        type: string
 */
const CourseGroupSchema = new mongoose.Schema({
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: { type: String, required: true, max: 100, index: true },
  description: { type: String, max: 1000 },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', index: true },
  key: { type: String, index: true },
  status: { type: String, enum: Object.values(GROUP_STATUS), default: GROUP_STATUS.ACTIVE, index: true },
}, {
  timestamps: true,
});

CourseGroupSchema.set('toJSON', {
  transform(doc, ret, options) { // eslint-disable-line no-unused-vars
    delete ret.__v;
    delete ret.updatedAt;
  },
});

export default mongoose.model('CourseGroup', CourseGroupSchema);
