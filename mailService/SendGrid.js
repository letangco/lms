import fs from 'fs';
import path from 'path';
import SendGridMail from '@sendgrid/mail';
import logger from '../server/util/logger';
import {
  SENDGRID_API_KEY,
} from '../server/config';
import emailTemplate from './locale.util';
import {
  DEFAULT_LANGUAGE,
  REDIS_KEYS,
  WORKER_NAME,
  EMAIL_COMMON_FIELDS, NOTIFICATION_LOG_STATUS,
} from '../server/constants';
import AMPQ from '../rabbitmq/ampq';
import Redis from '../server/util/Redis';
import NotificationLog from '../server/components/notification/notificaitionLog.model';

SendGridMail.setApiKey(SENDGRID_API_KEY);

/**
 * Read template from file
 * @param templateId
 * @param lang
 * @returns {Promise<Buffer|string>}
 */
async function readTemplate(templateId = 'templateDefault', lang = DEFAULT_LANGUAGE) {
  try {
    const cacheKey = `${REDIS_KEYS.MAIL_TEMPLATE}_${templateId}_${lang}`;
    // const template = await Redis.get(cacheKey);
    // if (typeof template === 'string') {
    //   return template;
    // }
    const filePath = `${path.resolve(__dirname, '../mailService/templates')}/${lang}/${templateId}.html`;
    const data = fs.readFileSync(filePath, 'utf8');
    await Redis.set(cacheKey, data);
    return data;
  } catch (error) {
    logger.error('SendGrid readTemplate error:', error);
    logger.error(`SendGrid readTemplate templateId: ${templateId}`);
    throw error;
  }
}

async function loadTemplate(templateId, data, lang = DEFAULT_LANGUAGE, subject = '') {
  const templateData = emailTemplate[lang]?.[templateId];
  if (templateData) {
    let html = await readTemplate(templateId, lang);
    subject = templateData?.subject || subject;
    if (typeof EMAIL_COMMON_FIELDS === 'object') {
      Object.keys(EMAIL_COMMON_FIELDS).forEach((dataKey) => {
        const regExpKeyWord = new RegExp(`{{${dataKey}}}`, 'g');
        html = html.replace(regExpKeyWord, EMAIL_COMMON_FIELDS[dataKey]);
      });
    }
    if (typeof data === 'object') {
      Object.keys(data).forEach((dataKey) => {
        const regExpKeyWord = new RegExp(`{{${dataKey}}}`, 'g');
        html = html.replace(regExpKeyWord, data[dataKey]);
      });
    }
    return {
      html,
      subject,
    };
  }
  throw Error(`Email template is not defined: ${templateId}`);
}

export async function singleSendMail({
  from, to, subject, html, attachments, files
}) {
  try {
    const payloadSendMail = await SendGridMail.send({
      from: {
        name: from.name,
        email: from.email,
      },
      to: to,
      subject: subject,
      html: html,
      attachments
    });
    if (Array.isArray(to)) {
      await Promise.all(to.map(async (item) => {
        await NotificationLog.create({
          recipient: item,
          subject: subject,
          message: html,
          files,
          messageId: payloadSendMail[0].headers['x-message-id']
        });
      }));
    } else {
      await NotificationLog.create({
        recipient: to,
        subject: subject,
        message: html,
        files,
        messageId: payloadSendMail[0].headers['x-message-id']
      });
    }
    return true;
  } catch (error) {
    await NotificationLog.create({
      recipient: to,
      subject: subject,
      message: html,
      files,
      status: NOTIFICATION_LOG_STATUS.FAILED
    });
    throw error;
  }
}

/**
 * https://sendgrid.com/docs/API_Reference/Web_API_v3/Mail/index.html
 * Send emails
 * @param {object} from
 * @param {string} from.name
 * @param {string} from.email
 * @param {string|string[]} to email, single email/an array of emails/email object {email, name}/array of email objects
 * @param {string} template
 * @param {object} data
 * @param {string} lang
 * @param {string} title
 * @returns {Promise<boolean>}
 */
export async function sendEmail({
  from, to, template = '', data, title, attachments, files
}, lang = DEFAULT_LANGUAGE) {
  try {
    let contentMail = data.content; let titleMail = title;
    if (template) {
      // Merge data to template
      const { html, subject } = await loadTemplate(template, data, lang, title);
      contentMail = html; titleMail = subject;
    }
    if (!(to instanceof Array)) {
      to = [to];
    }
    to.forEach((email) => {
      if (email) {
        AMPQ.sendDataToQueue(WORKER_NAME.SEND_MAIL, {
          from: from,
          to: email,
          subject: titleMail,
          html: contentMail,
          attachments,
          files
        });
      }
    });
    return true;
  } catch (error) {
    logger.error('SendGrid sendEmail error:', error);
    logger.error(`SendGrid sendEmail from, to, lang:', ${from}, ${to}, ${lang}`);
    logger.error(`SendGrid sendEmail data: ${data}`);
    throw error;
  }
}
