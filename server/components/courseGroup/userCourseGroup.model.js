import mongoose from 'mongoose';
import { USER_GROUP_STATUS, USER_GROUP_TYPE } from '../../constants';

/**
 * @swagger
 * definitions:
 *  User Course Group:
 *    type: object
 *    properties:
 *      _id:
 *        type: string
 *      user:
 *        type: string
 *      group:
 *        type: string
 *      course:
 *        type: string
 */
const UserCourseGroupSchema = new mongoose.Schema({
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  group: { type: mongoose.Schema.Types.ObjectId, ref: 'CourseGroup' },
  type: { type: String, enum: Object.values(USER_GROUP_TYPE), default: USER_GROUP_TYPE.USER },
  status: { type: String, enum: Object.values(USER_GROUP_STATUS), default: USER_GROUP_STATUS.ACTIVE },
}, {
  timestamps: true,
});

UserCourseGroupSchema.set('toJSON', {
  transform(doc, ret, options) { // eslint-disable-line no-unused-vars
    delete ret.__v;
    delete ret.createdAt;
    delete ret.updatedAt;
  },
});

export default mongoose.model('UserCourseGroup', UserCourseGroupSchema);
