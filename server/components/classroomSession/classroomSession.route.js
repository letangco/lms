import { Router } from 'express';
import * as ClassroomSessionValidator from './classroomSession.validator';
import * as ClassroomSessionController from './classroomSession.controller';
import { isAuthorized } from '../../api/auth.middleware';

const router = new Router();

/**
 * @swagger
 * /classroom-sessions/{id}:
 *   get:
 *     summary: Get classroom sessions
 *     tags:
 *       - Classroom Session
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Classroom id
 *       - name: begin
 *         in: query
 *         type: string
 *         required: true
 *         description: The begin time calendar display
 *       - name: end
 *         in: query
 *         type: string
 *         required: true
 *         description: The end time calendar display
 *     responses:
 *       200:
 *         description: User classrooms
 *         schema:
 *           type: object
 *           example: {
 *             success: true,
 *             payload: [
 *               {
 *                 "time": {
 *                   "begin": "2021-03-15T10:58:45.526Z",
 *                   "end": "2021-03-15T11:58:45.526Z"
 *                 },
 *                 "settings": {
 *                   "muteOnStart": false,
 *                   "requireModeratorApprove": false,
 *                   "anyUserCanStart": false,
 *                   "anyUserCanJoinAsModerator": false,
 *                   "accessCode": "111111"
 *                 },
 *                 "groups": [
 *                   {
 *                     "_id": "604f1c894a81de030ec6ffe3",
 *                     "name": "High school"
 *                   }
 *                 ],
 *                 "courses": [
 *                   {
 *                     "_id": "604b4105f70b39217bd85169",
 *                     "name": "Exam"
 *                   }
 *                 ],
 *                 "privacy": "CUSTOM",
 *                 "_id": "604f3677684f0b0417bc045f",
 *                 "creator": {
 *                   "_id": "6045e1c6f0fd1d0cbc504cfc",
 *                   "firstName": "Exam",
 *                   "lastName": "ple",
 *                   "username": "example",
 *                   "fullName": "Exam ple"
 *                 },
 *                 "name": "Demo event",
 *                 "timezone": {
 *                   "name": "(GMT +07:00) Asia/Ho_Chi_Minh",
 *                   "value": "Asia/Ho_Chi_Minh"
 *                 },
 *                 "description": "Demo event description",
 *                 "recorded": [],
 *               },
 *             ],
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
 *                 "msg": "Begin time is required",
 *                 "param": "begin",
 *               },
 *               {
 *                 "msg": "End time is required",
 *                 "param": "end",
 *               },
 *               {
 *                 "msg": "Classroom id is invalid",
 *                 "param": "id",
 *               },
 *             ]
 *           }
 *       500:
 *         description: When got server exception
 *         schema:
 *           type: string
 *           example: Internal server error
 */
router.route('/:id')
  .get(
    ClassroomSessionValidator.getClassroomSessions,
    isAuthorized(),
    ClassroomSessionController.getClassroomSessions,
  );

/**
 * @swagger
 * /classroom-sessions/{id}/search:
 *   get:
 *     summary: Search classroom sessions. Do not provide both firstId and lastId on same request.
 *     tags:
 *       - Classroom Session
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Classroom id
 *         schema:
 *           type: string
 *       - name: firstId
 *         in: query
 *         description: The first id of current sessions list on client, the users response will newer than the current newest session
 *         type: string
 *       - name: lastId
 *         in: query
 *         description: The last id of current sessions list on client, the users response will older than the current oldest session
 *         type: string
 *       - name: rowPerPage
 *         in: query
 *         description: The rowPerPage want to load
 *         type: string
 *       - name: textSearch
 *         in: query
 *         description: The textSearch search by session name
 *         type: string
 *       - name: types
 *         in: query
 *         description: The user type array string split by a comma
 *         type: string
 *     responses:
 *       200:
 *         description: The classrooms
 *         schema:
 *           type: object
 *           example: {
 *             success: true,
 *             payload: [
 *             ],
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
 *                 "value": "firstId",
 *                 "msg": "First id is invalid",
 *                 "param": "firstId",
 *                 "location": "query"
 *               },
 *               {
 *                 "value": "lastId",
 *                 "msg": "Last id is invalid",
 *                 "param": "lastId",
 *                 "location": "query"
 *               },
 *               {
 *                 "value": "abc",
 *                 "msg": "Row per page must be a number",
 *                 "param": "rowPerPage",
 *                 "location": "query"
 *               },
 *               {
 *                 "msg": "Classroom id is invalid",
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
router.route('/:id/search')
  .get(
    ClassroomSessionValidator.searchClassroomSessions,
    isAuthorized(),
    ClassroomSessionController.searchClassroomSessions,
  );

/**
 * @swagger
 * /classroom-sessions/{course}/{unit}/users:
 *   get:
 *     summary: Get classroom users
 *     tags:
 *       - Classroom Session
 *     parameters:
 *       - name: course
 *         in: path
 *         description: The course id
 *         type: string
 *         required: true
 *       - name: unit
 *         in: path
 *         description: The session id
 *         type: string
 *         required: true
 *       - name: page
 *         in: query
 *         description: The page want to load
 *         type: string
 *         required: true
 *       - name: rowPerPage
 *         in: query
 *         description: The rowPerPage want to load
 *         type: string
 *       - name: textSearch
 *         in: query
 *         description: The text search by user fullName
 *         type: string
 *       - name: order
 *         in: query
 *         description: The order field
 *         type: string
 *       - name: orderBy
 *         in: query
 *         description: The order type - desc or asc
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
 *               data:
 *                 $ref: '#/definitions/User'
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
 *                 "msg": "Session id is invalid",
 *                 "param": "id",
 *               },
 *               {
 *                 "msg": "Page number must be a positive integer",
 *                 "param": "page",
 *               },
 *               {
 *                 "msg": "Row per page must be a positive integer not larger than 200",
 *                 "param": "rowPerPage",
 *               },
 *               {
 *                 "msg": "Text search must not larger than 200 characters",
 *                 "param": "textSearch",
 *               },
 *               {
 *                 "msg": 'Order by value must be "desc" or "asc"',
 *                 "param": "orderBy",
 *               },
 *               {
 *                 "msg": "Order value must be fullName, role",
 *                 "param": "order",
 *               },
 *             ]
 *           }
 *       500:
 *         description: When got server exception
 *         schema:
 *           type: string
 *           example: "Internal server error"
 */
router.route('/:course/:unit/users')
  .get(
    ClassroomSessionValidator.getSessionUsers,
    isAuthorized(),
    ClassroomSessionController.getSessionUsers,
  );

export default router;
