import { Router } from 'express';
import * as NotificationValidator from './notificaition.validator';
import * as NotificationController from './notificaition.controller';
import { isAuthorized } from '../../api/auth.middleware';

const router = new Router();

router.route('/notification-data')
    .get(
        isAuthorized(),
        NotificationController.getNotificationData,
    );

router.route('/notification-event')
    .get(
        isAuthorized(),
        NotificationController.getNotificationEvent,
    );

router.route('/notification-user-type')
    .get(
        isAuthorized(),
        NotificationController.getNotificationUserType,
    );

router.route('/get-list-notification-log')
    .get(
        isAuthorized(),
        NotificationController.getListEmailHistory
    );

router.route('/clean-notification-log')
    .post(
        isAuthorized(),
        NotificationController.cleanNotificationLog
    );
router.route('/resend-email/:id')
    .post(
        isAuthorized(),
        NotificationController.resendEmailHistory
    );

router.route('/notification-log-status')
    .get(
        isAuthorized(),
        NotificationController.getNotificationLogStatus
    );

router.route('/notification-log/:id')
    .get(
        isAuthorized(),
        NotificationController.getNotificationLog
    );

/**
 * @swagger
 * /notifications:
 *   get:
 *     summary: Get notifications
 *     tags:
 *       - Notification
 *     parameters:
 *       - name: page
 *         in: query
 *         description: The page want to load
 *         type: string
 *       - name: rowPerPage
 *         in: query
 *         description: The rowPerPage want to load
 *         type: string
 *       - name: textSearch
 *         in: query
 *         description: Search by notification name
 *         type: string
 *     responses:
 *       200:
 *         description: The notifications data
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *             payload:
 *               type: array
 *               items:
 *                 $ref: '#/definitions/Notification'
 *           example: {
 *              success: true,
 *              "payload": {
 *                "data": [
 *                  {
 *                    "_id": "60421913582070092a398322",
 *                    "name": "High school",
 *                    "message": "High school notification",
 *                    "status": "ACTIVE",
 *                    "event": "RESET_PASSWORD",
 *                    "createdAt": "2021-04-20T09:16:08.166Z"
 *                  },
 *                ],
 *                "currentPage": 1,
 *                "totalPage": 1,
 *                "totalItems": 1
 *              }
 *           }
 *       401:
 *         description: Unauthorized
 *         schema:
 *           type: string
 *           example: Unauthorized
 *       422:
 *         description: Unprocessable Entity, the data is not valid
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *             errors:
 *               type: array
 *               items:
 *                 $ref: "#/definitions/ValidatorErrorItem"
 *           example: {
 *             success: false,
 *             errors: [
 *               {
 *                 "msg": "Row per page must be a positive integer not larger than 200",
 *                 "param": "rowPerPage",
 *               }
 *             ]
 *           }
 *       500:
 *         description: When got server exception
 *         schema:
 *           type: string
 *           example: "Internal server error"
 */
router.route('/')
    .get(
        NotificationValidator.getNotifications,
        isAuthorized(),
        NotificationController.getNotifications,
    );

/**
 * @swagger
 * /notifications/{id}:
 *   get:
 *     summary: Get notification
 *     tags:
 *       - Notification
 *     parameters:
 *       - name: id
 *         in: path
 *         description: The notification id
 *         type: string
 *         required: true
 *     responses:
 *       200:
 *         description: The notification data
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *             payload:
 *               type: object
 *               $ref: '#/definitions/Notification'
 *           example: {
 *              success: true,
 *              payload: {
 *                "_id": "60421913582070092a398322",
 *                "name": "High school",
 *                "message": "High school notification",
 *                "status": "ACTIVE",
 *                "event": "RESET_PASSWORD",
 *                "createdAt": "2021-04-20T09:16:08.166Z"
 *              }
 *           }
 *       401:
 *         description: Unauthorized
 *         schema:
 *           type: string
 *           example: Unauthorized
 *       404:
 *         description: Not found
 *         schema:
 *           type: string
 *           example: Notification not found
 *       422:
 *         description: Unprocessable Entity, the data is not valid
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *             errors:
 *               type: array
 *               items:
 *                 $ref: "#/definitions/ValidatorErrorItem"
 *           example: {
 *             success: false,
 *             errors: [
 *               {
 *                 "msg": "Notification id is invalid",
 *                 "param": "id",
 *               },
 *             ]
 *           }
 *       500:
 *         description: When got server exception
 *         schema:
 *           type: string
 *           example: "Internal server error"
 */
router.route('/:id')
    .get(
        NotificationValidator.getNotification,
        isAuthorized(),
        NotificationController.getNotification,
    );

/**
 * @swagger
 * /notifications:
 *   post:
 *     summary: Create notification
 *     tags:
 *       - Notification
 *     parameters:
 *       - name: body
 *         in: body
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *             message:
 *               type: string
 *             event:
 *               type: string
 *             hours:
 *               type: string
 *             status:
 *               type: string
 *           example: {
 *             "name": "High school",
 *             "message": "High school notification",
 *             "status": "ACTIVE",
 *             "event": "RESET_PASSWORD",
 *             "hour": 1
 *           }
 *     responses:
 *       200:
 *         description: The notification created
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *             payload:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 message:
 *                   type: string
 *                 event:
 *                   type: string
 *                 hours:
 *                   type: string
 *                 status:
 *                   type: string
 *           example: {
 *              success: true,
 *              payload: {
 *                "_id": "60421913582070092a398322",
 *                "name": "High school",
 *                "message": "High school notification",
 *                "status": "ACTIVE",
 *                "event": "RESET_PASSWORD",
 *                "createdAt": "2021-04-20T09:16:08.166Z"
 *              }
 *           }
 *       401:
 *         description: Unauthorized
 *         schema:
 *           type: string
 *           example: Unauthorized
 *       422:
 *         description: Unprocessable Entity, the data is not valid
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *             errors:
 *               type: array
 *               items:
 *                 $ref: "#/definitions/ValidatorErrorItem"
 *           example: {
 *             success: false,
 *             errors: [
 *               {
 *                 "msg": "Notification name cannot exceed 100 characters",
 *                 "param": "name",
 *               }
 *             ]
 *           }
 *       500:
 *         description: When got server exception
 *         schema:
 *           type: string
 *           example: "Internal server error"
 */
router.route('/')
    .post(
        NotificationValidator.createNotification,
        isAuthorized(),
        NotificationController.createNotification,
    );

/**
 * @swagger
 * /notifications/{id}:
 *   put:
 *     summary: Update notification
 *     tags:
 *       - Notification
 *     parameters:
 *       - name: id
 *         in: path
 *         description: The notification id
 *         type: string
 *       - name: body
 *         in: body
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *             message:
 *               type: string
 *             event:
 *               type: string
 *             status:
 *               type: string
 *             hours:
 *               type: number
 *           example: {
 *             "_id": "60421913582070092a398322",
 *             "name": "High school",
 *             "message": "High school notification",
 *             "hours": 5,
 *             "status": "ACTIVE",
 *             "event": "RESET_PASSWORD",
 *             "createdAt": "2021-04-20T09:16:08.166Z"
 *           }
 *     responses:
 *       200:
 *         description: The notification updated
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *           example: {
 *              success: true
 *           }
 *       304:
 *         description: Not Modified
 *       401:
 *         description: Unauthorized
 *         schema:
 *           type: string
 *           example: Unauthorized
 *       422:
 *         description: Unprocessable Entity, the data is not valid
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *             errors:
 *               type: array
 *               items:
 *                 $ref: "#/definitions/ValidatorErrorItem"
 *           example: {
 *             success: false,
 *             errors: [
 *               {
 *                 "msg": "Notification id is invalid",
 *                 "param": "id",
 *               },
 *               {
 *                 "msg": "Notification name cannot exceed 100 characters",
 *                 "param": "name",
 *               },
 *             ]
 *           }
 *       500:
 *         description: When got server exception
 *         schema:
 *           type: string
 *           example: "Internal server error"
 */
router.route('/:id')
    .put(
        NotificationValidator.updateNotification,
        isAuthorized(),
        NotificationController.updateNotification,
    );

/**
 * @swagger
 * /notifications/{id}:
 *   delete:
 *     summary: Delete notification
 *     tags:
 *       - Notification
 *     parameters:
 *       - name: id
 *         in: path
 *         description: The notification id
 *         type: string
 *     responses:
 *       200:
 *         description: The notification deleted
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
 *       422:
 *         description: Unprocessable Entity, the data is not valid
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *             errors:
 *               type: array
 *               items:
 *                 $ref: "#/definitions/ValidatorErrorItem"
 *           example: {
 *             success: false,
 *             errors: [
 *               {
 *                 "msg": "Notification id is invalid",
 *                 "param": "id",
 *               },
 *             ]
 *           }
 *       500:
 *         description: When got server exception
 *         schema:
 *           type: string
 *           example: "Internal server error"
 */
router.route('/:id')
    .delete(
        NotificationValidator.deleteNotification,
        isAuthorized(),
        NotificationController.deleteNotification,
    );

/**
 * @swagger
 * /notifications/get-list-notification-log:
 *   get:
 *     summary: Admin get list notify email log
 *     tags:
 *       - Email History
 *     parameters:
 *       - name: textSearch
 *         in: query
 *         description: search text email
 *         type: string
 *       - name: status
 *         in: query
 *         description: /pending/delivered/blocked/open/dropped/failed
 *         type: string
 *       - name: sort
 *         in: query
 *         description: sort timestamps desc/asc
 *         type: string
 *       - name: rowPerPage
 *         in: query
 *         description: limit item page default 1
 *         type: string
 *       - name: page
 *         in: query
 *         description: page default 1
 *         type: string
 *     responses:
 *       200:
 *         description: list notify email history
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *             payload:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 parent:
 *                   type: string
 *           example: {
 *              success: true,
 *              payload: {
 *                "_id": "60421913582070092a398322",
 *                "name": "High school",
 *                "parent": "60421913582070092a398321",
 *              }
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

/**
 * @swagger
 * /notifications/resend-email/{id}:
 *   put:
 *     summary: Resent a E-mail
 *     tags:
 *       - Email History
 *     parameters:
 *       - name: id
 *         in: path
 *         description: The email _id
 *         type: string
 *     responses:
 *       200:
 *         description: The email resend response
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *             payload:
 *               type: boolean
 *           example: {
 *              success: true,
 *              payload: true
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
export default router;
