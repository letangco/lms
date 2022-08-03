import mongoose from 'mongoose';
import { COURSE_USER_STATUS, USER_ROLES } from '../../constants';
import { addMembersToGroup } from '../chatGroup/chatGroup.service';

/**
 * @swagger
 * definitions:
 *  CourseUser:
 *    type: object
 *    properties:
 *      _id:
 *        type: string
 *      creator:
 *        type: string
 *      course:
 *        type: string
 *      user:
 *        type: string
 *      userRole:
 *        type: string
 *      enrolledDate:
 *        type: date
 *      completionDate:
 *        type: date
 *      progress:
 *        type: number
 *      score:
 *        type: number
 *      status:
 *        type: string
 */
const CourseUserSchema = new mongoose.Schema({
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userRole: { type: String, enum: [USER_ROLES.INSTRUCTOR, USER_ROLES.LEARNER], default: USER_ROLES.LEARNER, required: true },
  enrolledDate: { type: Date, default: Date.now },
  completionDate: { type: Date },
  progress: { type: Number },
  score: { type: Number },
  status: { type: String, enum: Object.values(COURSE_USER_STATUS), default: COURSE_USER_STATUS.ACTIVE }
}, {
  timestamps: true,
});

CourseUserSchema.index({ course: 1, user: 1, status: 1 });

CourseUserSchema.set('toJSON', {
  transform(doc, ret, options) { // eslint-disable-line no-unused-vars
    delete ret.__v;
    delete ret.status;
    delete ret.createdAt;
    delete ret.updatedAt;
  },
});

CourseUserSchema.post('save', async (courseUser, next) => {
  await addMembersToGroup(courseUser.course, [courseUser.user]);
  next();
});

export default mongoose.model('CourseUser', CourseUserSchema);
