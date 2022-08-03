import { Router } from 'express';
import * as TimezoneValidator from './timezone.validator';
import * as TimezoneController from './timezone.controller';
import { isAuthorized } from '../../api/auth.middleware';

const router = new Router();

/**
 * @swagger
 * /timezones:
 *   get:
 *     summary: Get timezones
 *     tags:
 *       - Timezone
 *     responses:
 *       200:
 *         description: The timezones data
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *             payload:
 *               type: array
 *               items:
 *                 $ref: '#/definitions/Timezone'
 *           example: {
 *              success: true,
 *              payload: [
 *                {
 *                  "_id": "60421913582070092a398394",
 *                  "name": "(GMT +07:00) Asia/Ho_Chi_Minh",
 *                  "value": "Asia/Ho_Chi_Minh",
 *                },
 *              ]
 *           }
 *       500:
 *         description: When got server exception
 *         schema:
 *           type: string
 *           example: "Internal server error"
 */
router.route('/')
  .get(
    TimezoneController.getTimezones,
  );

/**
 * @swagger
 * /timezones/{id}/deactivate:
 *   put:
 *     summary: Deactivate a timezone
 *     tags:
 *       - Timezone
 *     parameters:
 *       - name: id
 *         in: path
 *         description: The timezone id
 *         type: string
 *     responses:
 *       200:
 *         description: The timezone deactivated
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *           example: {
 *              success: true,
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
router.route('/:id/deactivate')
  .put(
    isAuthorized(),
    TimezoneValidator.deactivateTimezone,
    TimezoneController.deactivateTimezone,
  );

/**
 * @swagger
 * /timezones/{id}/activate:
 *   put:
 *     summary: Activate a timezone
 *     tags:
 *       - Timezone
 *     parameters:
 *       - name: id
 *         in: path
 *         description: The timezone id
 *         type: string
 *     responses:
 *       200:
 *         description: The timezone activated
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *           example: {
 *              success: true,
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
router.route('/:id/activate')
  .put(
    isAuthorized(),
    TimezoneValidator.activateTimezone,
    TimezoneController.activateTimezone,
  );

export default router;
