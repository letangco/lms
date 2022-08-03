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
 *      weight:
 *        type: number
 */
const UnitQuestionSchema = new mongoose.Schema({
  question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  unit: { type: mongoose.Schema.Types.ObjectId, ref: 'Unit' },
  order: { type: Number, required: true },
  weight: { type: Number, default: 1 },
}, {
  timestamps: true,
});
export default mongoose.model('UnitQuestion', UnitQuestionSchema);
