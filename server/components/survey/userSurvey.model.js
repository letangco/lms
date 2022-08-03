import mongoose from 'mongoose';

/**
 * @swagger
 * definitions:
 *  User Survey:
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
 *      survey:
 *        type: string
 *      type:
 *        type: string
 *      data:
 *        type: array
 *      result:
 *        type: string
 *      resultAnswers:
 *        type: array
 *      config:
 *        type: object
 */
const UserSurveySchema = new mongoose.Schema({
  title: { type: String, required: true, index: true },
  content: { type: String },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  unit: { type: mongoose.Schema.Types.ObjectId, ref: 'Unit' },
  survey: { type: mongoose.Schema.Types.ObjectId, ref: 'Survey' },
  type: { type: String, required: true },
  data: { type: Array },
  result: { type: String },
  resultAnswers: { type: Array },
  config: { type: Object }
}, {
  timestamps: true,
});

UserSurveySchema.set('toJSON', {
  transform(doc, ret, options) { // eslint-disable-line no-unused-vars
    delete ret.__v;
    delete ret.createdAt;
    delete ret.updatedAt;
  },
});
export default mongoose.model('UserSurvey', UserSurveySchema);
