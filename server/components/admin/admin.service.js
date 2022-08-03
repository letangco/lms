import passwordGenerator from 'generate-password';
import bcrypt from 'bcryptjs';
import NotificationLog from '../notification/notificaitionLog.model';
import User from '../user/user.model';
import logger from '../../util/logger';
import APIError from '../../util/APIError';
import { sendEmail } from '../../../mailService/SendGrid';
import { getSystemUserType } from '../userType/userType.service';

import {
  SENDER_EMAIL,
  SENDER_NAME,
  SUPER_ADMIN,
} from '../../config';
import {
  BCRYPT_SALT_ROUNDS,
  USER_STATUS,
  USER_ROLES,
  USER_MIN_PASSWORD_LENGTH,
  NOTIFICATION_LOG_STATUS,
} from '../../constants';
import { validSearchString } from '../../helpers/string.helper';

const fs = require('fs');
const path = require('path');

/**
 * Create super admin if doesn't have any timezone
 * @returns {Promise.<boolean>}
 */
export async function createSuperAdmin() {
  try {
    const superAdmin = await User.findOne({ email: SUPER_ADMIN.EMAIL });
    if (!superAdmin) {
      const password = passwordGenerator.generate({
        length: USER_MIN_PASSWORD_LENGTH,
        numbers: true,
      });
      try {
        const userType = await getSystemUserType(USER_ROLES.SUPER_ADMIN);
        if (!userType) {
          return Promise.reject(new APIError(403, [
            {
              msg: 'User type is not available',
              param: 'userTypeIsNotAvailable',
            }
          ]));
        }
        await User.create({
          firstName: SUPER_ADMIN.FIRST_NAME,
          lastName: SUPER_ADMIN.LAST_NAME,
          email: SUPER_ADMIN.EMAIL,
          username: SUPER_ADMIN.USERNAME,
          password: bcrypt.hashSync(password, BCRYPT_SALT_ROUNDS),
          status: USER_STATUS.ACTIVE,
          type: userType._id,
        });
      } catch (error) {
        logger.error('AdminService createSuperAdmin save error:', error);
        return Promise.reject(new APIError(500, 'Internal server error'));
      }
      // Send invitation email
      try {
        await sendEmail({
          from: {
            name: SENDER_NAME,
            email: SENDER_EMAIL,
          },
          to: SUPER_ADMIN.EMAIL,
          template: 'superAdminInvitation',
          data: {
            email: SUPER_ADMIN.EMAIL,
            password: password,
          }
        });
      } catch (error) {
        logger.error('AdminService createSuperAdmin sendEmail error:', error);
        return Promise.reject(new APIError(500, 'Internal server error'));
      }
      return true;
    }
    return false;
  } catch (error) {
    logger.error('AdminService createSuperAdmin error:', error);
    throw error;
  }
}

export async function handleEmailWebhook(data) {
  try {
    await Promise.all(data.map(async (payload) => {
      const messageId = payload.sg_message_id.substr(0, 22);
      const hasEmail = await NotificationLog.findOne({
        messageId,
        recipient: payload.email,
      });
      if (hasEmail) {
        switch (payload.event.toLowerCase()) {
          case 'delivered':
            hasEmail.status = NOTIFICATION_LOG_STATUS.DELIVERED;
            break;
          case 'dropped':
            hasEmail.status = NOTIFICATION_LOG_STATUS.DROPPED;
            break;
          case 'deferred':
            hasEmail.status = NOTIFICATION_LOG_STATUS.DEFERRED;
            break;
          case 'bounce':
            hasEmail.status = NOTIFICATION_LOG_STATUS.BOUNCE;
            break;
          case 'blocked':
            hasEmail.status = NOTIFICATION_LOG_STATUS.BLOCKED;
            break;
          case 'open':
            hasEmail.status = NOTIFICATION_LOG_STATUS.OPEN;
            break;
          case 'click':
            hasEmail.status = NOTIFICATION_LOG_STATUS.CLICK;
            break;
          case 'spamreport':
            hasEmail.status = NOTIFICATION_LOG_STATUS.SPAM_REPORT;
            break;
          default:
            break;
        }
        await hasEmail.save();
      }
    }));
    return true;
  } catch (error) {
    logger.error('Handle response webhook error:', error);
    throw error;
  }
}

export async function getNameReleaseNotes() {
  try {
    const files = [];
    const dir = path.join(__dirname, '../../../release');
    fs.readdirSync(dir).forEach((file) => {
      files.push(file.replace('.txt', ''));
    });
    return files.sort((n1, n2) => {
      const time1 = n1.slice(n1.indexOf('-') + 2);
      const time2 = n2.slice(n2.indexOf('-') + 2);
      return new Date(time2) - new Date(time1);
    });
  } catch (error) {
    logger.error('Get list release notes error:', error);
    throw error;
  }
}

export async function getInfoReleaseNote(name) {
  try {
    const dir = path.join(__dirname, `../../../release/${name}.txt`);
    const note = fs.readFileSync(dir, 'utf8');
    if (!note) return false;
    return note;
  } catch (error) {
    logger.error('Get release notes error:', error);
    throw error;
  }
}
