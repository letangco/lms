import mongoose from 'mongoose';
import {COURSE_USER_STATUS, UNIT_STATUS, UNIT_TYPE, USER_UNIT_STATUS} from '../../constants';
import * as CourseRulesAndPathService from '../courseRulesAndPath/courseRulesAndPath.service';
import {
  setCourseCompleted,
  setCourseStatus,
  setUserCourseScore,
} from '../courseUser/courseUser.service';
import { addUserPoints } from '../userReport/userReport.service';
import UserUnitTracking from './userUnitTracking.model';

/**
 * @swagger
 * definitions:
 *  Course Detail:
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
const UserUnitSchema = new mongoose.Schema({
  title: { type: String, required: true, index: true },
  unit: { type: mongoose.Schema.Types.ObjectId, ref: 'Unit', index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  type: { type: String, required: true },
  complete: { type: Object },
  content: { type: String },
  typeData: { type: String },
  link: { type: String },
  file: { type: mongoose.Schema.Types.ObjectId, ref: 'File' },
  config: { type: Object, default: {} },
  result: { type: Object, default: {} },
  points: { type: Number, default: 0 },
  snapshot: { type: mongoose.Schema.Types.ObjectId, ref: 'UserFile' },
  status: { type: String, required: true, default: USER_UNIT_STATUS.COMPLETED },
  unitStatus: { type: String, required: true, default: UNIT_STATUS.ACTIVE },
}, {
  timestamps: true,
});
UserUnitSchema.set('toJSON', {
  transform(doc, ret, options) { // eslint-disable-line no-unused-vars
    delete ret.__v;
    delete ret.createdAt;
    delete ret.updatedAt;
  },
});

async function handlePostUserUnit(userUnit) {
  if (userUnit.status === USER_UNIT_STATUS.COMPLETED) {
    const courseCompleted = await CourseRulesAndPathService.checkCourseCompleted(
      {
        _id: userUnit.user,
      },
      userUnit.course,
    );
    if (courseCompleted) {
      await setCourseCompleted(userUnit.user, userUnit.course);
    } else {
      await setCourseStatus(userUnit.user, userUnit.course, COURSE_USER_STATUS.IN_PROGRESS);
    }
  } else {
    await setCourseStatus(userUnit.user, userUnit.course, COURSE_USER_STATUS.IN_PROGRESS);
  }
  if ([UNIT_TYPE.TEST, UNIT_TYPE.ASSIGNMENT].indexOf(userUnit.type) !== -1) {
    const score = await CourseRulesAndPathService.calculateUserCourseScoreByAverageOf(userUnit.user, userUnit.course);
    await setUserCourseScore(userUnit.user, userUnit.course, score);
    await addUserPoints(userUnit.user, userUnit?.points ?? 0);
  }
}

async function createTrackingResult(userUnit) {
  try {
    const TRACKING_TYPE = [UNIT_TYPE.ASSIGNMENT];
    if (TRACKING_TYPE.includes(userUnit?.type) && userUnit?._id) {
      const data = JSON.parse(JSON.stringify(userUnit));
      data.submission = data._id;
      data.changer = data.user;
      delete data._id;
      await UserUnitTracking.create(data);
    }
  } catch (error) {}
}

async function updateTrackingResult(userUnit, dataUpdate) {
  try {
    const TRACKING_TYPE = [UNIT_TYPE.ASSIGNMENT];
    if (
      TRACKING_TYPE.includes(userUnit?.type)
      && typeof dataUpdate?.$set === 'object'
    ) {
      const dataTracking = JSON.parse(JSON.stringify(userUnit));
      dataTracking.submission = userUnit?._id;
      dataTracking.changer = dataUpdate?.$set?.result?.changer || dataUpdate?.$set?.['result.changer'];
      delete dataTracking?.result?.changer;
      delete dataTracking?.result?.changer;
      delete dataTracking?._id;
      await UserUnitTracking.create(dataTracking);
    }
  } catch (error) {}
}


UserUnitSchema.post('save', async (userUnit) => {
  await handlePostUserUnit(userUnit);
  await createTrackingResult(userUnit);
});

UserUnitSchema.post('updateOne', async function () {
  const conditions = this._conditions;
  const dataUpdate = this.getUpdate();
  const userUnit = await this.model.findOne(conditions);
  if (!userUnit) {
    return;
  }
  await handlePostUserUnit(userUnit);
  await updateTrackingResult(userUnit, dataUpdate);
});

UserUnitSchema.post('findOneAndUpdate', async function () {
  const conditions = this._conditions;
  const dataUpdate = this.getUpdate();
  const userUnit = await this.model.findOne(conditions);
  if (!userUnit) {
    return;
  }
  await updateTrackingResult(userUnit, dataUpdate);
});

export default mongoose.model('UserUnit', UserUnitSchema);
