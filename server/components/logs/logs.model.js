import mongoose from 'mongoose';
import { EVENT_LOGS, EVENT_LOGS_TYPE } from '../../constants';
/**
 * @swagger
 * definitions:
 *  Logs:
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
const LogsSchema = new mongoose.Schema({
  event: { type: String, required: true, enum: Object.values(EVENT_LOGS), index: true },
  type: { type: String, required: true, enum: Object.values(EVENT_LOGS_TYPE), index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  unDelete: { type: Boolean, default: false },
  data: {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    file: { type: mongoose.Schema.Types.ObjectId, ref: 'File' },
    group: { type: mongoose.Schema.Types.ObjectId, ref: 'CourseGroup' },
    unit: { type: mongoose.Schema.Types.ObjectId, ref: 'Unit' },
    notification: { type: mongoose.Schema.Types.ObjectId, ref: 'Notification' },
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'UserEvent' },
    discussion: { type: mongoose.Schema.Types.ObjectId, ref: 'Discussion' },
  }
}, {
  timestamps: true,
});

LogsSchema.set('toJSON', {
  transform(doc, ret, options) { // eslint-disable-line no-unused-vars
    delete ret.__v;
    delete ret.updatedAt;
  },
});

export default mongoose.model('Logs', LogsSchema);
