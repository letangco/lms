import mongoose from 'mongoose';
import {
  UNIT_STATUS,
  UNIT_TYPE,
  UNIT_STATUS_SUBMISSION,
  UNIT_STATUS_SUBMISSION_TYPE,
  USER_EVENT_STATUS
} from '../../constants';
import UserEvent from '../userEvent/userEvent.model';

/**
 * @swagger
 * definitions:
 *  Unit:
 *    type: object
 *    properties:
 *      _id:
 *        type: string
 *      title:
 *        type: string
 *      course:
 *        type: string
 *      type:
 *        type: number
 *      order:
 *        type: number
 *      complete:
 *        type: object
 *      content:
 *        type: string
 *      link:
 *        type: string
 *      file:
 *        type: string
 *      config:
 *        type: object
 *      status:
 *        type: number
 */
const UnitSchema = new mongoose.Schema({
  title: { type: String, required: true, index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', index: true },
  type: {
    type: String,
    required: true,
    index: true,
    enum: Object.values(UNIT_TYPE)
  },
  order: { type: Number, required: true },
  complete: { type: Object },
  content: { type: String },
  typeData: { type: String },
  link: { type: String },
  file: { type: mongoose.Schema.Types.ObjectId, ref: 'File' },
  clone: { type: mongoose.Schema.Types.ObjectId, ref: 'Unit' },
  config: { type: Object, default: {} },
  submissions: { type: String, required: true, default: UNIT_STATUS_SUBMISSION.USER },
  submissionsType: { type: String, required: true, default: UNIT_STATUS_SUBMISSION_TYPE.USER },
  status: { type: String, required: true, default: UNIT_STATUS.ACTIVE, index: true },
}, {
  timestamps: true,
});

UnitSchema.post('updateOne', async function (updated, next) {
  const conditions = this._conditions;
  const unit = await this.model.findOne(conditions).lean();
  if (unit?.type === UNIT_TYPE.LIVESTREAMING) {
    const userEvents = await UserEvent.find({
      unit: unit?._id,
      status: USER_EVENT_STATUS.ACTIVE
    });
    if (userEvents?.length === 1 && userEvents[0].name !== unit?.title) {
      userEvents[0].name = unit?.title;
      await userEvents?.[0]?.save();
    }
  }
  return next();
});


UnitSchema.set('toJSON', {
  transform(doc, ret, options) { // eslint-disable-line no-unused-vars
    delete ret.__v;
    delete ret.createdAt;
    delete ret.updatedAt;
  },
});
export default mongoose.model('Unit', UnitSchema);
