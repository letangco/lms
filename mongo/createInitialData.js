/**
 * Run the scripts to create initial data
 * @returns {Promise<boolean>}
 */
import logger from '../server/util/logger';
import { createSuperAdmin } from '../server/components/admin/admin.service';
import { createTimezone } from '../server/components/timezone/timezone.service';
import { createLanguage } from '../server/components/language/language.service';
import { createTeachingLanguage } from '../server/components/teachingLanguage/teachingLanguage.service';
import { createUserTypeUnits } from '../server/components/userTypeUnit/userTypeUnit.service';
import { createSystemUserTypes } from '../server/components/userType/userType.service';
import { createSystemNotification } from '../server/components/notification/notificaition.service';

export default async function createInitialData() {
  try {
    await createTimezone();
    await createLanguage();
    await createTeachingLanguage();
    await createUserTypeUnits();
    await createSystemUserTypes();
    await createSuperAdmin();
    await createSystemNotification();
    logger.info('createInitialData done');
    return true;
  } catch (error) {
    logger.error('createInitialData error:');
    logger.error(error);
    throw error;
  }
}
