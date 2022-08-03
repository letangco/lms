import mongoose from 'mongoose';

const Schema = mongoose.Schema;

/**
 * @swagger
 * definitions:
 *  UserEventViewTracking:
 *    type: object
 *    properties:
 *      _id:
 *        type: string
 *      event:
 *        type: objectId
 *      user:
 *        type: objectId
 *      internalMeetingId:
 *        type: string
 *      timeJoined:
 *        type: string
 *      timeLeft:
 *        type: string
 *      duration:
 *        type: number
 *        description: The event views duration in minutes
 */
const userEventViewTrackingSchema = new Schema({
  event: { type: Schema.ObjectId, required: true, ref: 'UserEvent', index: true },
  user: { type: Schema.ObjectId, required: true, ref: 'User', index: true },
  internalMeetingId: { type: String },
  timeJoined: { type: Date, required: true },
  timeLeft: { type: Date, required: true },
  duration: { type: Number, required: true }, // Total time (in second) watched
}, {
  timestamps: true,
});

export default mongoose.model('userEventViewTracking', userEventViewTrackingSchema);
