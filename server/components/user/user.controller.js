import Course from '../course/course.model';
import Unit from '../unit/unit.model';
import Event from '../userEvent/userEvent.model';
import UserSession from '../sessionUser/sessionUser.model';
import UserTracking from '../userEventViewTracking/userEventViewTracking.model';
import UserCourse from '../courseUser/courseUser.model';
import User from './user.model';
import * as UserService from './user.service';
import * as UserSettingService from '../userSetting/userSetting.service';
import {CHAT_GROUP_TYPE, COURSE_STATUS, ROOT_PATH, UNIT_STATUS, USER_STATUS} from '../../constants';
import { resizeImage } from '../../helpers/resize';
import { checkUserTypeIsAdmin } from '../userType/userType.service';
import ChatGroup from '../chatGroup/chatGroup.model';

export async function migrateData(req, res, next) {
  try {
    const courses = await Course.find({status: {$in: [COURSE_STATUS.DELETED, COURSE_STATUS.INACTIVE]} });
    if (courses?.length) {
      await Promise.all(courses.map(async course => {
        const units = await Unit.distinct('_id',{ course: course._id });
        await Unit.updateMany({
          course: course
        }, { $set: {
          status: course.status
        }});
        if (units?.length) {
          await UserSession.updateMany({
            unit: { $in: units }
          }, { $set: {
              status: course.status
            }});
          await Event.updateMany({
            unit: { $in: units }
          }, { $set: {
              status: course.status
            }});
        }
      }));
    }
    const unitsDelete = await Unit.find({status: {$in: [UNIT_STATUS.DELETED, UNIT_STATUS.INACTIVE, UNIT_STATUS.COURSEDELETED]} });
    if (unitsDelete?.length) {
      await Promise.all(unitsDelete.map(async unit => {
        await UserSession.updateMany({
          unit: unit._id
        }, {
          $set: {
            status: unit.status
          }
        });
        await Event.updateMany({
          unit: unit._id
        }, {
          $set: {
            status: unit.status
          }
        });
      }));
    }
    return res.json({
      success: true,
    });
  } catch (error) {
    return next(error);
  }
}
export async function migrateDataUserCourse(req, res, next) {
  try {
    const courses = await Course.find({status: {$in: [COURSE_STATUS.INACTIVE, COURSE_STATUS.ACTIVE]}});
    const users = await User.find({status: {$in: [USER_STATUS.INACTIVE, COURSE_STATUS.ACTIVE]}});
    await Promise.all(courses.map(async course => {
      await Promise.all(users.map(async user => {
        const count = await UserCourse.countDocuments({
          user: user._id,
          course: course._id,
          status: USER_STATUS.ACTIVE
        });
        if (count > 1) {
          await UserCourse.deleteOne({
            user: user._id,
            course: course._id,
            status: USER_STATUS.ACTIVE
          });
        }
      }));
    }));
    return res.json({
      success: true,
    });
  } catch (error) {
    return next(error);
  }
}
export async function migrateDataChat(req, res, next) {
  try {
    const courses = await Course.find({ parent: { $ne: null }});
    await ChatGroup.deleteMany({});
    if (courses?.length) {
      await Promise.all( courses.map(async course => {
        const usersCourse = await UserCourse.find({ course: course._id });
        await ChatGroup.create({
          course: course._id,
          type: CHAT_GROUP_TYPE.COURSE,
          members: usersCourse.map(userId => ({
            _id: userId.user,
            unread: 0,
          })),
        });
      }));
    }
  } catch (error) {
    return next(error);
  }
}
export async function migrateDataUserEvent(req, res, next) {
  try {
    const events = await Event.find({status: {$in: [COURSE_STATUS.INACTIVE, COURSE_STATUS.ACTIVE]}});
    const users = await User.find({status: {$in: [USER_STATUS.INACTIVE, COURSE_STATUS.ACTIVE]}});
    await Promise.all(events.map(async event => {
      await Promise.all(users.map(async user => {
        const count = await UserSession.countDocuments({
          user: user._id,
          session: event._id,
          status: USER_STATUS.ACTIVE
        });
        if (count > 1) {
          await UserSession.deleteOne({
            user: user._id,
            session: event._id,
            status: USER_STATUS.ACTIVE
          })
        }
      }));
    }));
    return res.json({
      success: true,
    });
  } catch (error) {
    return next(error);
  }
}
export async function migrateDataUserEventTracking(req, res, next) {
  try {
    const tracking = await UserTracking.find({}, {
      user: 1,
      event: 1,
      internalMeetingId: 1,
      timeJoined: 1,
      timeLeft: 1,
    }).sort({ _id: 1 })
    tracking.map(async doc => {
      await UserTracking.deleteMany({
        _id:{$gt: doc._id},
        user: doc.user,
        event: doc.event,
        internalMeetingId: doc.internalMeetingId,
        timeJoined: doc.timeJoined,
        timeLeft: doc.timeLeft,
      });
    });
    return res.json({
      success: true,
    });
  } catch (error) {
    return next(error);
  }
}
export async function login(req, res, next) {
  try {
    const {
      body,
    } = req;
    const user = await UserService.login(body.email, body.password);
    return res.json({
      success: true,
      payload: user,
    });
  } catch (error) {
    return next(error);
  }
}
export async function trackingLoginTimes(req, res, next) {
  try {
    // await checkUserTypeIsAdmin(req.auth?.type);
    const {
      query,
    } = req;
    const user = await UserService.trackingLoginTimes(query);
    return res.json({
      success: true,
      payload: user,
    });
  } catch (error) {
    return next(error);
  }
}
export async function adminLoginUser(req, res, next) {
  try {
    const {
      params,
    } = req;
    const user = await UserService.adminLoginUser(req.auth, params.id);
    return res.json({
      success: true,
      payload: user,
    });
  } catch (error) {
    return next(error);
  }
}

export async function getUser(req, res, next) {
  try {
    const {
      auth,
    } = req;
    const user = await UserService.getMyUser(auth._id);
    return res.json({
      success: true,
      payload: user,
    });
  } catch (error) {
    return next(error);
  }
}

export async function getUserInfo(req, res, next) {
  try {
    const {
      auth,
    } = req;
    const user = await UserService.getUserInfo(auth, req.params.id);
    return res.json({
      success: true,
      payload: user,
    });
  } catch (error) {
    return next(error);
  }
}

export async function updateUserProfile(req, res, next) {
  try {
    const {
      body,
      auth,
    } = req;
    const info = {};
    const file = req.file;
    if (file) {
      const rootPath = file.destination.replace(`${ROOT_PATH}/`, '');
      info.avatar = `${rootPath}/${file.filename}`;
      resizeImage(info.avatar);
    }
    Object.keys(body).forEach((bodyKey) => {
      info[bodyKey] = body[bodyKey];
    });
    const user = await UserService.updateUserProfile(auth, info);
    return res.json({
      success: true,
      payload: user,
    });
  } catch (error) {
    return next(error);
  }
}

export async function adminUpdateUserProfile(req, res, next) {
  try {
    const {
      body,
      auth,
    } = req;
    const info = {};
    const file = req.file;
    if (file) {
      const rootPath = file.destination.replace(`${ROOT_PATH}/`, '');
      info.avatar = `${rootPath}/${file.filename}`;
      resizeImage(info.avatar);
    }
    Object.keys(body).forEach((bodyKey) => {
      info[bodyKey] = body[bodyKey];
    });
    const user = await UserService.adminUpdateUserProfile(auth, req.params.id, info);
    return res.json({
      success: true,
      payload: user,
    });
  } catch (error) {
    return next(error);
  }
}

export async function createUser(req, res, next) {
  try {
    const {
      body,
      auth,
    } = req;
    const info = {};
    const file = req.file;
    if (file) {
      const rootPath = file.destination.replace(`${ROOT_PATH}/`, '');
      info.avatar = `${rootPath}/${file.filename}`;
      resizeImage(info.avatar);
    }
    Object.keys(body).forEach((bodyKey) => {
      info[bodyKey] = body[bodyKey];
    });
    const user = await UserService.createUser(auth, info);
    return res.json({
      success: true,
      payload: user,
    });
  } catch (error) {
    return next(error);
  }
}

export async function deleteUser(req, res, next) {
  try {
    await UserService.deleteUser(req.params.id, req.auth);
    return res.json({
      success: true,
    });
  } catch (error) {
    return next(error);
  }
}

export async function permanentlyDeleteUser(req, res, next) {
  try {
    await UserService.permanentlyDeleteUser(req.params.id, req.auth);
    return res.json({
      success: true,
    });
  } catch (error) {
    return next(error);
  }
}

export async function getUsers(req, res, next) {
  try {
    const data = await UserService.getUsers(req.query, req.auth);
    return res.json({
      success: true,
      payload: data,
    });
  } catch (error) {
    return next(error);
  }
}

export async function searchUsers(req, res, next) {
  try {
    const {
      firstId,
      lastId,
      rowPerPage,
      textSearch,
      roles,
    } = req.query;
    const data = await UserService.searchUsers({
      rowPerPage,
      firstId,
      lastId,
      textSearch,
      roles,
    });
    return res.json({
      success: true,
      payload: data,
    });
  } catch (error) {
    return next(error);
  }
}

export async function forgotPassword(req, res, next) {
  try {
    const body = req.body;
    const data = await UserService.forgotPassword(body);
    return res.json({
      success: true,
      payload: data,
    });
  } catch (error) {
    return next(error);
  }
}

export async function verifyForgotPassword(req, res, next) {
  try {
    const auth = req.auth;
    const newPassword = req.body.newPassword;
    await UserService.verifyForgotPassword(auth, newPassword);
    return res.json({
      success: true,
      payload: 'Password update success, please login with new password',
    });
  } catch (error) {
    return next(error);
  }
}

export async function importUser(req, res, next) {
  try {
    const auth = req.auth;
    const users = req.body.data;
    await UserService.importUser(users, auth);
    return res.json({
      success: true
    });
  } catch (error) {
    return next(error);
  }
}

export async function checkImportUser(req, res, next) {
  try {
    const users = req.body.data;
    return res.json({
      success: true,
      payload: await UserService.checkImportUser(users)
    });
  } catch (error) {
    return next(error);
  }
}
export async function importData(req, res, next) {
  try {
    const auth = req.auth;
    return res.json({
      success: true,
      payload: await UserService.importData(req.body.data, auth)
    });
  } catch (error) {
    return next(error);
  }
}
export async function exportData(req, res, next) {
  try {
    return res.json({
      success: true,
      payload: await UserService.exportData()
    });
  } catch (error) {
    return next(error);
  }
}

export async function checkImport(req, res, next) {
  try {
    return res.json({
      success: true,
      payload: await UserService.checkImport(req.body.data)
    });
  } catch (error) {
    return next(error);
  }
}

export async function getUserConfig(req, res, next) {
  try {
    const auth = req.auth;
    const key = req.query.key;
    return res.json({
      success: true,
      payload: await UserSettingService.getUserSetting({
        key,
        user: auth?._id
      })
    });
  } catch (error) {
    return next(error);
  }
}

export async function addUserConfig(req, res, next) {
  try {
    const auth = req.auth;
    const key = req.query.key;
    return res.json({
      success: true,
      payload: await UserSettingService.updateUserSettings(auth?._id, key, req.body)
    });
  } catch (error) {
    return next(error);
  }
}

export async function resetUserUnreadMessage(req, res, next) {
  try {
    const auth = req.auth;
    await UserService.resetUserUnreadMessage(auth._id);
    return res.json({
      success: true,
    });
  } catch (error) {
    return next(error);
  }
}
