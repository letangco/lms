import mongoose from 'mongoose';
import {
  NOTIFICATION_LOG_STATUS
} from '../../constants';

/**
 * @swagger
 * definitions:
 *  Notification Log:
 *    type: object
 *    properties:
 *      _id:
 *        type: string
 *      recipient:
 *        type: string
 *      name:
 *        type: string
 *      message:
 *        type: string
 *      event:
 *        type: string
 *      status:
 *        type: string
 */
const NotificationLogSchema = new mongoose.Schema({
  recipient: { type: String, index: true },
  subject: { type: String },
  message: { type: String },
  status: {
    type: String, enum: Object.values(NOTIFICATION_LOG_STATUS),
    default: NOTIFICATION_LOG_STATUS.PENDING,
    index: true
  },
  messageId: { type: String },
  files: { type: Array }
}, {
  timestamps: true,
});

NotificationLogSchema.set('toJSON', {
  transform(doc, ret, options) { // eslint-disable-line no-unused-vars
    delete ret.__v;
    delete ret.updatedAt;
  },
});

export default mongoose.model('NotificationLog', NotificationLogSchema);
