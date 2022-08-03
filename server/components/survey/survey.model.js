import mongoose from 'mongoose';
import { SURVEY_STATUS } from '../../constants';

/**
 * @swagger
 * definitions:
 *  Survey:
 *    type: object
 *    properties:
 *      _id:
 *        type: string
 *      user:
 *        type: string
 *      title:
 *        type: string
 *      content:
 *        type: string
 *      type:
 *        type: number
 *      tag:
 *        type: array
 *      feedback:
 *        type: string
 *      data:
 *        type: object
 *      status:
 *        type: string
 */
const SurveySchema = new mongoose.Schema({
  title: { type: String, required: true, index: true },
  content: { type: String },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  type: { type: String, required: true },
  data: { type: Array },
  config: { type: Object },
  tag: { type: Array },
  feedback: { type: String },
  status: { type: String, required: true, default: SURVEY_STATUS.ACTIVE },
}, {
  timestamps: true,
});

SurveySchema.set('toJSON', {
  transform(doc, ret, options) { // eslint-disable-line no-unused-vars
    delete ret.__v;
    delete ret.createdAt;
    delete ret.updatedAt;
  },
});
export default mongoose.model('Survey', SurveySchema);
