import logger from '../../util/logger';
import { USER_ROLES, USER_ROLE_NAMES } from '../../constants';

/**
 * Get user roles
 * @returns {Promise.<{id: *}>} Return user or an error
 */
export async function getUserRoles() {
  try {
    return {
      [USER_ROLES.ADMIN]: USER_ROLE_NAMES[USER_ROLES.ADMIN],
      [USER_ROLES.INSTRUCTOR]: USER_ROLE_NAMES[USER_ROLES.INSTRUCTOR],
      [USER_ROLES.LEARNER]: USER_ROLE_NAMES[USER_ROLES.LEARNER],
    };
  } catch (error) {
    logger.error(`UserRoleService getUserRoles error: ${error}`);
    throw error;
  }
}
