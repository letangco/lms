import mongoose from 'mongoose';
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
 *      event_ts:
 *        type: string
 *      payload:
 *        type: object
 */
const ZoomReportSchema = new mongoose.Schema({
  event: { type: String },
  event_ts: { type: Number },
  payload: { type: Object },
}, {
  timestamps: true,
});

ZoomReportSchema.set('toJSON', {
  transform(doc, ret, options) { // eslint-disable-line no-unused-vars
    delete ret.__v;
    delete ret.createdAt;
    delete ret.updatedAt;
  },
});
export default mongoose.model('ZoomReport', ZoomReportSchema);
