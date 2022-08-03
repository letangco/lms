import mongoose from 'mongoose';
import { USER_ROLES, USER_TYPE_STATUS } from '../../constants';

/**
 * @swagger
 * definitions:
 *  UserType:
 *    type: object
 *    properties:
 *      _id:
 *        type: string
 *      name:
 *        type: string
 *      roles:
 *        type: array
 *        items:
 *          type: string
 *      defaultRole:
 *        type: string
 *      systemRole:
 *        type: string
 *        description: the system role auto generate
 *      userTypeUnits:
 *        type: array
 *        items:
 *          type: string
 *      status:
 *        type: string
 */
const UserTypeSchema = new mongoose.Schema({
  name: { type: String, required: true, index: true },
  roles: [{ type: String, enum: Object.values(USER_ROLES) }],
  key: { type: String, index: true },
  defaultRole: { type: String, enum: Object.values(USER_ROLES), required: true },
  systemRole: { type: String, enum: Object.values(USER_ROLES) },
  userTypeUnits: [{ type: mongoose.Schema.Types.ObjectId, ref: 'UserTypeUnit' }],
  status: { type: String, enum: Object.values(USER_TYPE_STATUS), default: USER_TYPE_STATUS.ACTIVE, index: true },
}, {
  timestamps: true,
});

UserTypeSchema.set('toJSON', {
  transform(doc, ret, options) { // eslint-disable-line no-unused-vars
    delete ret.__v;
    delete ret.createdAt;
    delete ret.updatedAt;
  },
});

export default mongoose.model('UserType', UserTypeSchema);
