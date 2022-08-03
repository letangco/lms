import mongoose from 'mongoose';
import { SESSION_USER_STATUS, SESSION_USER_GRADE_STATUS, SESSION_USER_ATTENDANCE } from '../../constants';
import * as UserCourseService from '../userCourse/userCourse.service';

/**
 * @swagger
 * definitions:
 *  SessionUser:
 *    type: object
 *    properties:
 *      _id:
 *        type: string
 *      creator:
 *        type: string
 *      user:
 *        type: string
 *      session:
 *        type: string
 *      unit:
 *        type: string
 *      gradeDate:
 *        type: number
 *      grade:
 *        type: string
 *      gradeStatus:
 *        type: string
 *      gradeComment:
 *        type: string
 *      attendance:
 *        type: object
 *        properties:
 *          status:
 *            type: string
 *          timeJoined:
 *            type: number
 *          timeLeft:
 *            type: number
 *      deletedAt:
 *        type: date
 *      status:
 *        type: string
 */
const SessionUserSchema = new mongoose.Schema({
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  session: { type: mongoose.Schema.Types.ObjectId, ref: 'UserEvent', index: true },
  unit: { type: mongoose.Schema.Types.ObjectId, ref: 'Unit', index: true },
  gradeDate: { type: Number }, // timestamp
  grade: { type: Number },
  gradeStatus: { type: String, enum: Object.values(SESSION_USER_GRADE_STATUS), default: SESSION_USER_GRADE_STATUS.PENDING },
  gradeComment: { type: String },
  attendance: {
    status: { type: String, enum: Object.values(SESSION_USER_ATTENDANCE) },
    timeJoined: { type: Number },
    timeLeft: { type: Number },
  },
  deletedAt: { type: Date },
  status: { type: String, enum: Object.values(SESSION_USER_STATUS), default: SESSION_USER_STATUS.ACTIVE, index: true },
}, {
  timestamps: true,
});

SessionUserSchema.index({ user: 1, session: 1, unit: 1 });

SessionUserSchema.post('updateOne', async function (updated, next) {
  const conditions = this._conditions;
  const userSession = await this.model.findOne(conditions);
  if (userSession) {
    await UserCourseService.updateCompleteUnit(userSession);
  }
  return next();
});

SessionUserSchema.set('toJSON', {
  transform(doc, ret, options) { // eslint-disable-line no-unused-vars
    delete ret.__v;
    delete ret.status;
    delete ret.createdAt;
    delete ret.updatedAt;
  },
});

export default mongoose.model('SessionUser', SessionUserSchema);
