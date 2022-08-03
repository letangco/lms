import mongoose from 'mongoose';
import {ZOOM_STATUS, ZOOM_STATUS_LIVE} from '../../constants';
/**
 * @swagger
 * definitions:
 *  Unit:
 *    type: object
 *    properties:
 *      _id:
 *        type: string
 *      zoom_client:
 *        type: string
 *      zoom_key:
 *        type: string
 *      zoom_sec:
 *        type: string
 *      status:
 *        type: string
 */
const ZoomConfigSchema = new mongoose.Schema({
  zoom_client: { type: String, index: true },
  zoom_key: { type: String },
  zoom_sec: { type: String },
  zoom_webhook: { type: String },
  status: { type: String, enum: Object.values(ZOOM_STATUS), default: ZOOM_STATUS.ACTIVE, index: true },
  statusLive: { type: String, enum: Object.values(ZOOM_STATUS_LIVE), default: ZOOM_STATUS_LIVE.OFFLINE, index: true },
}, {
  timestamps: true,
});

ZoomConfigSchema.set('toJSON', {
  transform(doc, ret, options) { // eslint-disable-line no-unused-vars
    delete ret.__v;
  },
});
export default mongoose.model('ZoomConfig', ZoomConfigSchema);
