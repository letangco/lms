import mongoose from 'mongoose';
/**
 * @swagger
 * definitions:
 *  UnitQuestion:
 *    type: object
 *    properties:
 *      _id:
 *        type: string
 *      question:
 *        type: string
 *      unit:
 *        type: string
 *      order:
 *        type: number
 */
const UnitSurveySchema = new mongoose.Schema({
  survey: { type: mongoose.Schema.Types.ObjectId, ref: 'Survey' },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  unit: { type: mongoose.Schema.Types.ObjectId, ref: 'Unit' },
  order: { type: Number, required: true }
}, {
  timestamps: true,
});
export default mongoose.model('UnitSurvey', UnitSurveySchema);
