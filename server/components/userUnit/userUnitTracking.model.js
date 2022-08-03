import mongoose from 'mongoose';
import { USER_UNIT_STATUS } from '../../constants';

const UserUnitTrackingSchema = new mongoose.Schema({
  title: { type: String, required: true, index: true },
  unit: { type: mongoose.Schema.Types.ObjectId, ref: 'Unit', index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  changer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  submission: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserUnit',
    index: true
  },
  type: { type: String, required: true },
  complete: { type: Object },
  content: { type: String },
  typeData: { type: String },
  result: { type: Object, default: {} },
  points: { type: Number, default: 0 },
  status: { type: String, required: true, default: USER_UNIT_STATUS.COMPLETED },
  reSubmitted: { type: Boolean, default: false }
}, {
  timestamps: true,
});
UserUnitTrackingSchema.set('toJSON', {
  transform(doc, ret, options) { // eslint-disable-line no-unused-vars
    delete ret.__v;
    delete ret.updatedAt;
  },
});

export default mongoose.model('UserUnitTracking', UserUnitTrackingSchema);
