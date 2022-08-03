import mongoose from 'mongoose';
import {
  USER_EVENT_STATUS,
  USER_EVENT_PRIVACY,
  USER_EVENT_TYPE, USER_ROOM_STATUS, USER_EVENT,
  LIVESTREAM_TYPE
} from '../../constants';
import { getTimezoneInfo } from '../timezone/timezone.service';
import {updateTitleUnitLive} from "../unit/unit.service";

const Schema = mongoose.Schema;

/**
 * @swagger
 * definitions:
 *  UserEvent:
 *    type: object
 *    properties:
 *      _id:
 *        type: string
 *      creator:
 *        type: string
 *      name:
 *        type: string
 *      time:
 *        type: object
 *        properties:
 *          begin:
 *            type: date
 *          end:
 *            type: date
 *      timezone:
 *        type: string
 *      location:
 *        type: string
 *      description:
 *        type: string
 *      duration:
 *        type: number
 *        description: The event duration in minutes
 *      recorded:
 *        type: array
 *        items:
 *          type: object
 *          properties:
 *            _id:
 *              type: objectId
 *            playback:
 *              type: object
 *            public:
 *              type: boolean
 *      settings:
 *        type: object
 *        properties:
 *          muteOnStart:
 *            type: boolean
 *          guestPolicy:
 *            type: string
 *          anyUserCanStart:
 *            type: boolean
 *          anyUserCanJoinAsModerator:
 *            type: boolean
 *      instructor:
 *        type: string
 *      groups:
 *        type: array
 *        items:
 *          type: string
 *          description: The group _id
 *      courses:
 *        type: array
 *        items:
 *          type: string
 *          description: The course _id
 *      unit:
 *        type: string
 *      privacy:
 *        type: string
 *      status:
 *        type: string
 *      type:
 *        type: string
 */
const UserEventSchema = new Schema({
  creator: { type: Schema.ObjectId, ref: 'User', required: true },
  name: { type: String, index: true, required: true },
  time: {
    begin: { type: Date, required: true },
    end: { type: Date, required: true },
  },
  timezone: { type: String },
  location: { type: Schema.ObjectId, ref: 'Location' },
  description: { type: String, max: 1000 },
  duration: { type: Number, min: 1, max: 240 }, // In minute
  recorded: [{
    _id: { type: String },
    time: { type: Number },
    type: { type: String, enum: Object.values(LIVESTREAM_TYPE), default: LIVESTREAM_TYPE.BBB },
    playback: { type: Object },
    public: { type: Boolean, default: true },
  }],
  settings: {
    accessCode: { type: String },
    muteOnStart: { type: Boolean, default: false },
    requireModeratorApprove: { type: Boolean, default: false },
    anyUserCanStart: { type: Boolean, default: false }, // Allow any user to start this meeting
    anyUserCanJoinAsModerator: { type: Boolean, default: false }, // All users join as moderator
  },
  instructor: { type: Schema.ObjectId, ref: 'User' },
  groups: [{ type: Schema.ObjectId, ref: 'Group' }],
  courses: [{ type: Schema.ObjectId, ref: 'Course' }],
  unit: { type: Schema.ObjectId, ref: 'Unit' },
  privacy: { type: String, enum: Object.values(USER_EVENT_PRIVACY), default: USER_EVENT_PRIVACY.PRIVATE },
  optionUser: { type: String, enum: Object.values(USER_EVENT), default: USER_EVENT.ALL },
  status: {
    type: String,
    required: true,
    enum: Object.values(USER_EVENT_STATUS),
    default: USER_EVENT_STATUS.ACTIVE,
    index: true
  },
  roomStatus: {
    type: String,
    required: true,
    enum: Object.values(USER_ROOM_STATUS),
    default: USER_ROOM_STATUS.NEW,
  },
  type: {
    type: String,
    required: true,
    enum: Object.values(USER_EVENT_TYPE),
    default: USER_EVENT_TYPE.EVENT,
  },
}, {
  timestamps: true,
});

UserEventSchema.post('save', async (userEvent) => {
  await updateTitleUnitLive(userEvent);
});

UserEventSchema.post('updateOne', async function (updated, next) {
  const conditions = this._conditions;
  const userEvent = await this.model.findOne(conditions).lean();
  await updateTitleUnitLive(userEvent);
  return next();
});


UserEventSchema.set('toJSON', {
  transform(doc, ret, options) { // eslint-disable-line no-unused-vars
    delete ret.__v;
    delete ret.createdAt;
    delete ret.updatedAt;
    delete ret.status;
    if (ret.timezone) {
      ret.timezone = getTimezoneInfo(ret.timezone);
    }
    const recorded = ret.recorded;
    if (recorded?.length > 0) {
      const recordedFiltered = [];
      recorded.forEach((record) => {
        if (record.type === LIVESTREAM_TYPE.ZOOM) {
          recordedFiltered.push({
            public: record.public,
            time: record.time,
            type: record.type,
            playback: {
              duration: record.playback.duration,
              size: record.playback.total_size,
              link: record.playback.share_url
            }
          });
        } else if (record.public) {
          recordedFiltered.push(record);
        }
      });
      ret.recorded = recordedFiltered;
    }
  },
});

export default mongoose.model('UserEvent', UserEventSchema);
