import mongoose from 'mongoose';
import { USER_ZOOM_STATUS_LIVE } from "../../constants";
/**
 * @swagger
 * definitions:
 *  Unit:
 *    type: object
 *    properties:
 *      _id:
 *        type: string
 *      event:
 *        type: string
 *      zoom:
 *        type: object
 */
const UserZoomSchema = new mongoose.Schema({
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'UserEvent', index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  email: { type: String },
  zoom: { type: Object },
  status: { type: String, enum: Object.values(USER_ZOOM_STATUS_LIVE), default: USER_ZOOM_STATUS_LIVE.WAITING, index: true },
}, {
  timestamps: true,
});

UserZoomSchema.set('toJSON', {
  transform(doc, ret, options) { // eslint-disable-line no-unused-vars
    delete ret.__v;
    delete ret.createdAt;
    delete ret.updatedAt;
  },
});
export default mongoose.model('UserZoom', UserZoomSchema);
