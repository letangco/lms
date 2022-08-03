import mongoose from 'mongoose';
import { ROOM_STATUS } from '../../constants';
import ZoomEvent from './zoomEvent.model';
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
 *      startTime:
 *        type: number
 *      endTime:
 *        type: number
 */
const ZoomSchema = new mongoose.Schema({
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'UserEvent', index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  zoom: { type: Object },
  account: { type: Object },
  status: { type: String, enum: Object.values(ROOM_STATUS), default: ROOM_STATUS.PENDING, index: true },
  startTime: { type: Number },
  endTime: { type: Number },
}, {
  timestamps: true,
});
ZoomSchema.pre('deleteMany', async function (next) {
  try {
    const deletedData = await Zoom.find(this._conditions).lean();
    await Promise.all(deletedData?.map( async data => {
      await ZoomEvent.deleteOne({
        $or: [
          { 'payload.object.id': data?.zoom.toString() },
          { 'payload.object.id': parseInt(data?.zoom) },
        ]
      });
    }));
    return next();
  } catch (error) {
    return next(error);
  }
});
ZoomSchema.set('toJSON', {
  transform(doc, ret, options) { // eslint-disable-line no-unused-vars
    delete ret.__v;
    delete ret.account;
    delete ret.createdAt;
    delete ret.updatedAt;
  },
});
let Zoom = mongoose.model("Zoom", ZoomSchema);
module.exports = Zoom;
