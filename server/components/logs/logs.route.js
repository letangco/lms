import { Router } from 'express';
import * as LogsController from './logs.controller';
import { isAuthorized } from '../../api/auth.middleware';
import { cleanLogs } from './logs.controller';

const router = new Router();

/**
 * @swagger
 * /logs:
 *   get:
 *     summary: Get logs
 *     tags:
 *       - Logs
 *     parameters:
 *       - name: event
 *         in: query
 *         description: event log
 *         type: string
 *       - name: user
 *         in: query
 *         description: user id
 *         type: string
 *       - name: course
 *         in: query
 *         description: course id
 *         type: string
 *       - name: intake
 *         in: query
 *         description: intake id
 *         type: string
 *       - name: from
 *         in: query
 *         description: from date search
 *         type: string
 *       - name: to
 *         in: query
 *         description: to date search
 *         type: string
 *       - name: to
 *         in: query
 *         description: to date search
 *         type: string
 *       - name: page
 *         in: query
 *         description: The page want to load
 *         type: string
 *       - name: rowPerPage
 *         in: query
 *         description: The rowPerPage want to load
 *         type: string
 *     responses:
 *       200:
 *         description: The logs data
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *             payload:
 *               type: array
 *               items:
 *                 $ref: '#/definitions/Logs'
 *           example: {
 *              success: true,
 *              payload: [
 *                {
 *                  "_id": "60421913582070092a398322",
 *                  "description": "Meeting room",
 *                  "event": "USER-LOGIN",
 *                  "action": []
 *                },
 *              ]
 *           }
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
router.route('/')
  .get(
    isAuthorized(),
    LogsController.getLogs,
  );
router.route('/get-event-list')
  .get(
    isAuthorized(),
    LogsController.getEventList,
  );
router.route('/get-event-type')
  .get(
    isAuthorized(),
    LogsController.getEventType,
  );
router.route('/undo')
  .post(
    isAuthorized(),
    LogsController.undoEvent,
  );
router.route('/clean-log')
  .post(
    isAuthorized(),
    LogsController.cleanLogs,
  );

export default router;
