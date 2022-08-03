import { Router } from 'express';
import * as AdminController from './admin.controller';
import { isAuthorized } from '../../api/auth.middleware';

const router = new Router();

router.route('/delivery-email-webhook')
  .post(
    AdminController.deliveryEmailWebhook
  );

/**
 * @swagger
 * /admin/list-name-release-note:
 *   get:
 *     summary: Get list name release note
 *     tags:
 *       - Release Note
 *     responses:
 *       200:
 *         description: List name release note
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *             payload:
 *               type: array
 *           example: {
 *              success: true,
 *              payload: []
 *           }
 *       304:
 *         description: Not Modified
 *       401:
 *         description: Unauthorized
 *         schema:
 *           type: string
 *           example: Unauthorized
 *       500:
 *         description: When got server exception
 *         schema:
 *           type: string
 *           example: "Internal server error"
 */
router.route('/list-name-release-note')
  .get(
    isAuthorized(),
    AdminController.getNameReleaseNotes
  );

/**
 * @swagger
 * /admin/get-release-note/{name}:
 *   get:
 *     summary: Get info release note
 *     tags:
 *       - Release Note
 *     parameters:
 *       - name: name
 *         in: path
 *         description: The name release
 *         type: string
 *     responses:
 *       200:
 *         description: The content of release
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *             payload:
 *               type: string
 *           example: {
 *              success: true,
 *              payload: "**Release notes Jun 15,2021**\n\n- _Product name: Enrichment LMS_\n- _Product week: week 4_\n- _Prepared by: Vi Dinh_\n\n\n**New features:**\n1. New unit type: File upload\n  - Admin can create new file unit or edit or delete existed file unit, which contains\nmultiple attachments and can be shared to custom audiences within the available\ntime.\n2. System log\n  - Admin can view the history tracking all create, update, delete and log in activities of users. Admin can also undo the delete action.\n  - Has these following features:\n    + Search & filter by User name\n    + Filter by event\n    + Filter by course\n    + Filter by intake\n    + Filter by user type\n    + Filter by date\n    + Clear system log\n3. Email history\n  - Admin can view email history, resend an email and also can attach files in an email template.\n  - Has these following features:\n    + Search by text (Recipient)\n    + Filter by status\n    + Clear history\n    + Sort by Recipient name, Subject name, Date, Status\n    + Resend email\n\n**Improvements:**\n1. Notification:\n  - Be able to attach file when creating email template (Up to 100MB each file)\n2. Live event:\n  - Show directly creating page and hide the calendar\n  - One live unit has only one live event\n\n**Fixes:**\n1. Fixed: Chat feature\n  - Now we have intake code beside the intake name\n  - Online status\n  - Fix problems sending, receiving messages\n2. Fixed: Display correctly ongoing live sessions information\n"
 *           }
 *       304:
 *         description: Not Modified
 *       401:
 *         description: Unauthorized
 *         schema:
 *           type: string
 *           example: Unauthorized
 *       500:
 *         description: When got server exception
 *         schema:
 *           type: string
 *           example: "Internal server error"
 */
router.route('/get-release-note/:note')
  .get(
    isAuthorized(),
    AdminController.getInfoReleaseNote
  );

export default router;
