import mongoose from 'mongoose';
import { USER_QUESTION_STATUS, RESULT_TYPE } from '../../constants';
import { getFileById } from '../file/file.service';

/**
 * @swagger
 * definitions:
 *  User Question:
 *    type: object
 *    properties:
 *      _id:
 *        type: string
 *      title:
 *        type: string
 *      content:
 *        type: string
 *      user:
 *        type: string
 *      course:
 *        type: string
 *      unit:
 *        type: string
 *      question:
 *        type: string
 *      type:
 *        type: string
 *      data:
 *        type: array
 *      result:
 *        type: array
 *      config:
 *        type: object
 *      status:
 *        type: string
 */
const UserQuestionSchema = new mongoose.Schema({
  title: { type: String, required: true, index: true },
  content: { type: String },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  unit: { type: mongoose.Schema.Types.ObjectId, ref: 'Unit' },
  question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
  type: { type: String, required: true },
  typeResult: { type: String, default: RESULT_TYPE.CONTENT },
  data: { type: Array },
  dataContent: { type: String },
  contentHTML: { type: String },
  result: { type: Array },
  resultAnswers: { type: Array },
  points: { type:  Number },
  weight: { type:  Number },
  config: { type: Object },
  status: { type: String, default: USER_QUESTION_STATUS.COMPLETED }
}, {
  timestamps: true,
});

UserQuestionSchema.set('toJSON', {
  transform(doc, ret, options) { // eslint-disable-line no-unused-vars
    delete ret.__v;
    delete ret.createdAt;
    delete ret.updatedAt;
  },
});
export default mongoose.model('UserQuestion', UserQuestionSchema);
