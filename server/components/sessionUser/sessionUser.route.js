import { Router } from 'express';
import * as SessionUserValidator from './sessionUser.validator';
import * as SessionUserController from './sessionUser.controller';
import { isAuthorized } from '../../api/auth.middleware';

const router = new Router();

/**
 * @swagger
 * /session-users:
 *   post:
 *     summary: Create session user
 *     tags:
 *       - Session User
 *     parameters:
 *       - name: body
 *         in: body
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             session:
 *               type: string
 *             user:
 *               type: string
 *             unit:
 *               type: string
 *           example: {
 *             "session": "60421913582070092a398322",
 *             "user": "60421913582070092a398323",
 *             "unit": "6045e1c6f0fd1d0cbc504cf1",
 *           }
 *     responses:
 *       200:
 *         description: The session user created
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
 *                 session:
 *                   type: string
 *                 user:
 *                   type: string
 *                 userRole:
 *                   type: string
 *                 unit:
 *                   type: string
 *           example: {
 *              success: true,
 *              payload: {
 *                "_id": "6051d3f44c3d0002db5ce7e4",
 *                "creator": "6045e1c6f0fd1d0cbc504cfc",
 *                "session": "60519a0cc55c0307c516af43",
 *                "user": {
 *                  "status": "ACTIVE",
 *                  "_id": "6045e1c6f0fd1d0cbc504cf2",
 *                  "firstName": "Exadm",
 *                  "lastName": "ple",
 *                  "username": "nhannguyen",
 *                  "fullName": "Exadm ple"
 *                },
 *                "userRole": "LEARNER",
 *                "unit": "6045e1c6f0fd1d0cbc504cf1",
 *              }
 *           }
 *       401:
 *         description: Unauthorized
 *         schema:
 *           type: string
 *           example: Unauthorized
 *       403:
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
 *                 "msg": "User already assign to session",
 *                 "param": "userAssigned",
 *               },
 *               {
 *                 "msg": "User not found",
 *                 "param": "userNotFound",
 *               },
 *               {
 *                 "msg": "User role not valid",
 *                 "param": "userRoleNotValid",
 *               },
 *             ]
 *           }
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
 *                 "msg": "Session id is invalid",
 *                 "param": "session",
 *               },
 *               {
 *                 "msg": "User id is invalid",
 *                 "param": "user",
 *               },
 *               {
 *                 "msg": "Unit id is invalid",
 *                 "param": "unit",
 *               },
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
    SessionUserValidator.createSessionUser,
    isAuthorized(),
    SessionUserController.createSessionUser,
  );

/**
 * @swagger
 * /session-users/registry:
 *   post:
 *     summary: User enroll to classroom session
 *     tags:
 *       - Session User
 *     parameters:
 *       - name: body
 *         in: body
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             session:
 *               type: string
 *             unit:
 *               type: string
 *           example: {
 *             "session": "60421913582070092a398322",
 *             "unit": "6045e1c6f0fd1d0cbc504cf1",
 *           }
 *     responses:
 *       200:
 *         description: The session user created
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
 *                 session:
 *                   type: string
 *                 user:
 *                   type: string
 *                 userRole:
 *                   type: string
 *                 unit:
 *                   type: string
 *           example: {
 *              success: true,
 *              payload: {
 *                "_id": "6051d3f44c3d0002db5ce7e4",
 *                "creator": "6045e1c6f0fd1d0cbc504cfc",
 *                "session": "60519a0cc55c0307c516af43",
 *                "user": {
 *                  "status": "ACTIVE",
 *                  "_id": "6045e1c6f0fd1d0cbc504cf2",
 *                  "firstName": "Exadm",
 *                  "lastName": "ple",
 *                  "username": "nhannguyen",
 *                  "fullName": "Exadm ple"
 *                },
 *                "userRole": "LEARNER",
 *                "unit": "6045e1c6f0fd1d0cbc504cf1",
 *              }
 *           }
 *       401:
 *         description: Unauthorized
 *         schema:
 *           type: string
 *           example: Unauthorized
 *       403:
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
 *                 "msg": "User already assign to session",
 *                 "param": "userAssigned",
 *               },
 *               {
 *                 "msg": "User not found",
 *                 "param": "userNotFound",
 *               },
 *               {
 *                 "msg": "User role not valid",
 *                 "param": "userRoleNotValid",
 *               },
 *             ]
 *           }
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
 *                 "msg": "Session id is invalid",
 *                 "param": "session",
 *               },
 *               {
 *                 "msg": "Unit id is invalid",
 *                 "param": "unit",
 *               },
 *             ]
 *           }
 *       500:
 *         description: When got server exception
 *         schema:
 *           type: string
 *           example: "Internal server error"
 */
router.route('/registry')
  .post(
    SessionUserValidator.registrySessionUser,
    isAuthorized(),
    SessionUserController.registrySessionUser,
  );

/**
 * @swagger
 * /session-users/{id}/registry:
 *   delete:
 *     summary: Delete session user registered
 *     tags:
 *       - Session User
 *     parameters:
 *       - name: id
 *         in: path
 *         description: The session user id
 *         type: string
 *     responses:
 *       200:
 *         description: The session user deleted
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
 *                 "msg": "Session user id is invalid",
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
router.route('/:id/registry')
  .delete(
    SessionUserValidator.removeRegistrySessionUser,
    isAuthorized(),
    SessionUserController.removeRegistrySessionUser,
  );

/**
 * @swagger
 * /session-users/{id}/users:
 *   get:
 *     summary: Get session users
 *     tags:
 *       - Session User
 *     parameters:
 *       - name: id
 *         in: path
 *         description: The session id
 *         type: string
 *       - name: page
 *         in: query
 *         description: The page want to load
 *         type: string
 *         required: true
 *       - name: rowPerPage
 *         in: query
 *         description: The rowPerPage want to load
 *         type: string
 *     responses:
 *       200:
 *         description: The session users data
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *             payload:
 *               type: array
 *               items:
 *                 $ref: '#/definitions/SessionUser'
 *           example: {
 *              success: true,
 *              "payload": {
 *                "data": [
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
 *                 "msg": "Page number must be a positive integer",
 *                 "param": "page",
 *               },
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
router.route('/:id/users')
  .get(
    SessionUserValidator.getSessionUsers,
    isAuthorized(),
    SessionUserController.getSessionUsers,
  );

/**
 * @swagger
 * /session-users/{id}:
 *   delete:
 *     summary: Delete session user
 *     tags:
 *       - Session User
 *     parameters:
 *       - name: id
 *         in: path
 *         description: The session user id
 *         type: string
 *     responses:
 *       200:
 *         description: The session user deleted
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
 *                 "msg": "Session user id is invalid",
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
    SessionUserValidator.deleteSessionUser,
    isAuthorized(),
    SessionUserController.deleteSessionUser,
  );

/**
 * @swagger
 * /session-users/{id}:
 *   get:
 *     summary: Get session user
 *     tags:
 *       - Session User
 *     parameters:
 *       - name: id
 *         in: path
 *         description: The session user id
 *         type: string
 *     responses:
 *       200:
 *         description: The session user deleted
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *             payload:
 *               type: object
 *           example: {
 *              success: true,
 *              payload: {},
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
 *                 "msg": "Session user id is invalid",
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
    SessionUserValidator.getSessionUser,
    isAuthorized(),
    SessionUserController.getSessionUser,
  );

/**
 * @swagger
 * /session-users/bulk-update:
 *   put:
 *     summary: Bulk update session user
 *     tags:
 *       - Session User
 *     parameters:
 *       - name: body
 *         in: body
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             ids:
 *               type: array
 *               items:
 *                 type: objectId
 *             attendance:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 timeJoined:
 *                   type: number
 *                 timeLeft:
 *                   type: number
 *           example: {
 *             "ids": ["60519a0cc55c0307c516af43"],
 *             "attendance": {
 *               "status": "JOINED",
 *               "timeJoined": 1618209915110,
 *               "timeLeft": 1618219915110,
 *             },
 *           }
 *     responses:
 *       200:
 *         description: The session user updated
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *           example: {
 *              success: true,
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
 *                 "msg": "Session user id is invalid",
 *                 "param": "ids[0]",
 *               },
 *               {
 *                 "msg": "Attendance must be an object",
 *                 "param": "attendance",
 *               },
 *               {
 *                 "msg": "Attendance status is invalid",
 *                 "param": "attendance.status",
 *               },
 *               {
 *                 "msg": "Attendance time join is invalid",
 *                 "param": "attendance.timeJoined",
 *               },
 *               {
 *                 "msg": "Attendance time left is invalid",
 *                 "param": "attendance.timeLeft",
 *               },
 *             ]
 *           }
 *       500:
 *         description: When got server exception
 *         schema:
 *           type: string
 *           example: "Internal server error"
 */
router.route('/bulk-update')
  .put(
    SessionUserValidator.bulkUpdateSessionUser,
    isAuthorized(),
    SessionUserController.bulkUpdateSessionUser,
  );

/**
 * @swagger
 * /session-users/{id}:
 *   put:
 *     summary: Update session user
 *     tags:
 *       - Session User
 *     parameters:
 *       - name: id
 *         in: path
 *         description: The session user id
 *         type: string
 *       - name: body
 *         in: body
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             session:
 *               type: string
 *             grade:
 *               type: string
 *             gradeStatus:
 *               type: string
 *             gradeComment:
 *               type: string
 *             attendance:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 timeJoined:
 *                   type: number
 *                 timeLeft:
 *                   type: number
 *           example: {
 *             "session": "60519a0cc55c0307c516af43",
 *             "grade": 100,
 *             "gradeStatus": "PASSED",
 *             "gradeComment": "Amazing, good job",
 *             "attendance": {
 *               "status": "JOINED",
 *               "timeJoined": 1618209915110,
 *               "timeLeft": 1618219915110,
 *             },
 *           }
 *     responses:
 *       200:
 *         description: The session user updated
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *             payload:
 *               type: object
 *               $ref: '#/definitions/SessionUser'
 *           example: {
 *              success: true,
 *              payload: {
 *              }
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
 *                 "msg": "Session user id is invalid",
 *                 "param": "id",
 *               },
 *               {
 *                 "msg": "Session id is invalid",
 *                 "param": "session",
 *               },
 *               {
 *                 "msg": "Session user grade must be integer and between 0 and 100",
 *                 "param": "grade",
 *               },
 *               {
 *                 "msg": "Grade status is invalid",
 *                 "param": "gradeStatus",
 *               },
 *               {
 *                 "msg": "Comment cannot exceed 5000 characters",
 *                 "param": "gradeComment",
 *               },
 *               {
 *                 "msg": "Attendance must be an object",
 *                 "param": "attendance",
 *               },
 *               {
 *                 "msg": "Attendance status is invalid",
 *                 "param": "attendance.status",
 *               },
 *               {
 *                 "msg": "Attendance time join is invalid",
 *                 "param": "attendance.timeJoined",
 *               },
 *               {
 *                 "msg": "Attendance time left is invalid",
 *                 "param": "attendance.timeLeft",
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
    SessionUserValidator.updateSessionUser,
    isAuthorized(),
    SessionUserController.updateSessionUser,
  );

export default router;
