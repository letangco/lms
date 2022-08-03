import mongoose from 'mongoose';
import { USER_ROLES, USER_TYPE_UNIT_METHODS, USER_TYPE_UNIT_STATUS } from '../../constants';

/**
 * @swagger
 * definitions:
 *  UserTypeUnit:
 *    type: object
 *    properties:
 *      _id:
 *        type: string
 *      name:
 *        type: string
 *      role:
 *        type: string
 *      routes:
 *        type: array
 *        items:
 *          type: object
 *          properties:
 *            method:
 *              type: string
 *            role:
 *              type: string
 *            route:
 *              type: string
 *      dependencies:
 *        type: array
 *        items:
 *          type: objectId
 *          description: The dependencies when check this unit
 *      parent:
 *        type: string
 *      status:
 *        type: string
 */
const UserTypeUnitSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, enum: Object.values(USER_ROLES) },
  routes: {
    type: [{
      method: { type: String, enum: Object.values(USER_TYPE_UNIT_METHODS) },
      role: { type: String, enum: Object.values(USER_ROLES) },
      route: { type: String },
    }],
    // eslint-disable-next-line no-undefined
    default: undefined,
  },
  dependencies: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'UserTypeUnit' }],
    // eslint-disable-next-line no-undefined
    default: undefined,
  },
  parent: { type: mongoose.Schema.Types.ObjectId, ref: 'UserTypeUnit' },
  status: { type: String, enum: Object.values(USER_TYPE_UNIT_STATUS), default: USER_TYPE_UNIT_STATUS.ACTIVE },
}, {
  timestamps: true,
});

UserTypeUnitSchema.set('toJSON', {
  transform(doc, ret, options) { // eslint-disable-line no-unused-vars
    delete ret.__v;
    delete ret.createdAt;
    delete ret.updatedAt;
    delete ret.status;
  },
});

export default mongoose.model('UserTypeUnit', UserTypeUnitSchema);
