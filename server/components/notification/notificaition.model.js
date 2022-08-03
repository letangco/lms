import mongoose from 'mongoose';
import {
  NOTIFICATION_STATUS,
  NOTIFICATION_EVENT,
  USER_ROLES_NOTIFICATION
} from '../../constants';

/**
 * @swagger
 * definitions:
 *  Notification:
 *    type: object
 *    properties:
 *      _id:
 *        type: string
 *      creator:
 *        type: string
 *      name:
 *        type: string
 *      message:
 *        type: string
 *      event:
 *        type: string
 *      hours:
 *        type: number
 *      status:
 *        type: string
 */
const NotificationSchema = new mongoose.Schema({
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  name: { type: String, max: 100, index: true },
  message: { type: String },
  design: { type: Object },
  event: { type: String, enum: Object.values(NOTIFICATION_EVENT) },
  userType: { type: String, enum: Object.values(USER_ROLES_NOTIFICATION) },
  files: { type: Array },
  hours: { type: Number },
  status: { type: String, enum: Object.values(NOTIFICATION_STATUS), default: NOTIFICATION_STATUS.ACTIVE, index: true }
}, {
  timestamps: true,
});

NotificationSchema.set('toJSON', {
  transform(doc, ret, options) { // eslint-disable-line no-unused-vars
    delete ret.__v;
    delete ret.status;
    delete ret.updatedAt;
  },
});

export default mongoose.model('Notification', NotificationSchema);
