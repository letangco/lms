import mongoose from 'mongoose';
import { QUESTION_STATUS } from '../../constants';

/**
 * @swagger
 * definitions:
 *  Question:
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
const QuestionSchema = new mongoose.Schema({
  title: { type: String, required: true, index: true },
  content: { type: String },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  type: { type: String, required: true },
  data: { type: Array },
  contentHTML: { type: String },
  config: { type: Object },
  tag: { type: Array },
  feedback: { type: String },
  status: { type: String, required: true, default: QUESTION_STATUS.ACTIVE },
}, {
  timestamps: true,
});

QuestionSchema.set('toJSON', {
  transform(doc, ret, options) { // eslint-disable-line no-unused-vars
    delete ret.__v;
    delete ret.createdAt;
    delete ret.updatedAt;
  },
});
export default mongoose.model('Question', QuestionSchema);
