import { Router } from 'express';
import * as UserEventValidator from './userEvent.validator';
import * as UserEventController from './userEvent.controller';
import { isAuthorized } from '../../api/auth.middleware';

const router = new Router();

/**
 * @swagger
 * /user-events:
 *   get:
 *     summary: Get user events
 *     tags:
 *       - User Event
 *     parameters:
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
 *       - name: types
 *         in: query
 *         type: string
 *         required: true
 *         description: The event type
 *       - name: unit
 *         in: query
 *         type: string
 *         description: The unit id
 *     responses:
 *       200:
 *         description: User events
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
 *                 "msg": "Unit id is invalid",
 *                 "param": "unit",
 *               },
 *             ]
 *           }
 *       500:
 *         description: When got server exception
 *         schema:
 *           type: string
 *           example: Internal server error
 */
router.route('/')
  .get(
    UserEventValidator.getUserEvents,
    isAuthorized(),
    UserEventController.getUserEvents,
  );

router.route('/get-events-live')
    .get(
        isAuthorized(),
        UserEventController.getUserEventsLive,
    );
router.route('/get-users-event/:id')
    .get(
        isAuthorized(),
        UserEventController.getUsersEvent,
    );
/**
 * @swagger
 * /user-events:
 *   post:
 *     summary: Create user event
 *     tags:
 *       - User Event
 *     parameters:
 *       - in: body
 *         name: data
 *         type: object
 *         description: The user event information
 *         schema:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *             time:
 *               type: object
 *               properties:
 *                 begin:
 *                   type: string
 *                 end:
 *                   type: string
 *             timezone:
 *               type: string
 *             location:
 *               type: string
 *             description:
 *               type: string
 *             duration:
 *               type: string
 *             settings:
 *               type: object
 *               properties:
 *                 accessCode:
 *                   type: string
 *                 muteOnStart:
 *                   type: boolean
 *                 requireModeratorApprove:
 *                   type: boolean
 *                 anyUserCanStart:
 *                   type: boolean
 *                 anyUserCanJoinAsModerator:
 *                   type: boolean
 *             privacy:
 *               type: string
 *             groups:
 *               type: array
 *               items:
 *                 type: string
 *             courses:
 *               type: array
 *               items:
 *                 type: string
 *             unit:
 *               type: string
 *             type:
 *               type: string
 *           example: {
 *             "name": "Demo event",
 *             "time": {
 *               "begin": "2020-07-20T10:58:45.526Z",
 *               "end": "2020-07-20T11:58:45.526Z",
 *             },
 *             "timezone": "Asia/Ho_Chi_Minh",
 *             "location": "HCMC",
 *             "description": "Demo event description",
 *             "duration": 100,
 *             "settings": {
 *               "accessCode": "111111",
 *               "muteOnStart": false,
 *               "requireModeratorApprove": false,
 *               "anyUserCanStart": false,
 *               "anyUserCanJoinAsModerator": false,
 *             },
 *             "privacy": "CUSTOM",
 *             "groups": [
 *               "5f6c6d8785cb3700b8de9521",
 *             ],
 *             "courses": [
 *               "5f6c6d8785cb3700b8de9522",
 *             ],
 *             "unit": "5f6c6d8785cb3700b8de9522",
 *             "type": "EVENT",
 *           }
 *     responses:
 *       200:
 *         description: Create user event success
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
 *                 creator:
 *                   type: string
 *                 name:
 *                   type: string
 *                 time:
 *                   type: object
 *                   properties:
 *                     begin:
 *                       type: string
 *                     end:
 *                       type: string
 *                 timezone:
 *                   type: string
 *                 location:
 *                   type: sting
 *                 description:
 *                   type: strong
 *                 duration:
 *                   type: number
 *                 settings:
 *                   type: object
 *                   properties:
 *                     accessCode:
 *                       type: string
 *                     muteOnStart:
 *                       type: boolean
 *                     requireModeratorApprove:
 *                       type: boolean
 *                     anyUserCanStart:
 *                       type: boolean
 *                     anyUserCanJoinAsModerator:
 *                       type: boolean
 *                 privacy:
 *                   type: string
 *                 groups:
 *                   type: array
 *                   items:
 *                     type: string
 *                 courses:
 *                   type: array
 *                   items:
 *                     type: string
 *                 classroom:
 *                   type: string
 *                 type:
 *                   type: string
 *           example: {
 *             "success": true,
 *             "payload": {
 *               "settings": {
 *                 "muteOnStart": false,
 *                 "requireModeratorApprove": false,
 *                 "anyUserCanStart": false,
 *                 "anyUserCanJoinAsModerator": false,
 *                 "accessCode": "111111"
 *               },
 *               "groups": [
 *                 "604f1c894a81de030ec6ffe3"
 *               ],
 *               "courses": [
 *                 "604b4105f70b39217bd85169"
 *               ],
 *               "privacy": "CUSTOM",
 *               "_id": "604f3677684f0b0417bc045f",
 *               "creator": "6045e1c6f0fd1d0cbc504cfc",
 *               "name": "Demo event",
 *               "time": {
 *                 "begin": "2021-03-15T10:58:45.526Z",
 *                 "end": "2021-03-15T11:58:45.526Z"
 *               },
 *               "timezone": {
 *                 "name": "(GMT +07:00) Asia/Ho_Chi_Minh",
 *                 "value": "Asia/Ho_Chi_Minh"
 *               },
 *               "location": "HCMC",
 *               "description": "Demo event description",
 *               "duration": 100,
 *               "recorded": [],
 *               "unit": "6045e1c6f0fd1d0cbc504cfc",
 *               "type": "EVENT",
 *             }
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
 *                 "value": "",
 *                 "msg": "Event setting mute on start is invalid",
 *                 "param": "settings.muteOnStart",
 *                 "location": "body"
 *               },
 *               {
 *                 "value": "",
 *                 "msg": "Event setting moderator approve is invalid",
 *                 "param": "settings.requireModeratorApprove",
 *                 "location": "body"
 *               },
 *               {
 *                 "value": "",
 *                 "msg": "Event setting any user can start is invalid",
 *                 "param": "settings.anyUserCanStart",
 *                 "location": "body"
 *               },
 *               {
 *                 "value": "",
 *                 "msg": "Event setting any user can join as moderator is invalid",
 *                 "param": "settings.anyUserCanJoinAsModerator",
 *                 "location": "body"
 *               },
 *               {
 *                 "value": "",
 *                 "msg": "Event name is required",
 *                 "param": "name",
 *                 "location": "body"
 *               },
 *               {
 *                 "value": "",
 *                 "msg": "Begin time is invalid",
 *                 "param": "time.begin",
 *                 "location": "body"
 *               },
 *               {
 *                 "value": "",
 *                 "msg": "End time is invalid",
 *                 "param": "time.end",
 *                 "location": "body"
 *               },
 *               {
 *                 "value": "sd",
 *                 "msg": "Timezone is invalid",
 *                 "param": "timezone",
 *                 "location": "body"
 *               },
 *               {
 *                 "value": "very long string",
 *                 "msg": "User event description cannot exceed 1000 characters",
 *                 "param": "description",
 *                 "location": "body"
 *               },
 *               {
 *                 "value": "12343",
 *                 "msg": "User event duration cannot larger than 1440",
 *                 "param": "duration",
 *                 "location": "body"
 *               },
 *               {
 *                 "value": "sd",
 *                 "msg": "Privacy id is invalid",
 *                 "param": "privacy",
 *                 "location": "body",
 *               },
 *               {
 *                 "value": "ad",
 *                 "msg": "Unit id is invalid",
 *                 "param": "unit",
 *                 "location": "body",
 *               },
 *               {
 *                 "value": "dsd",
 *                 "msg": "Event type is invalid",
 *                 "param": "type",
 *                 "location": "body",
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
    UserEventValidator.createUserEvent,
    isAuthorized(),
    UserEventController.createUserEvent,
  );

/**
 * @swagger
 * /user-events/{id}:
 *   get:
 *     summary: Get event detail
 *     tags:
 *       - User Event
 *     parameters:
 *       - name: id
 *         in: path
 *         description: The user event id
 *         type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Event info
 *         type: object
 *         schema:
 *           type: object
 *           example: {
 *             "success": true,
 *             "payload": {
 *               "_id": "5f157bc6cd88b11501dd3cff",
 *               "title": "ree",
 *               "time": {
 *                 "begin": "2020-07-20T08:58:45.526Z",
 *                 "end": "2020-07-20T10:58:45.526Z"
 *               },
 *               "creator": {
 *                 "_id": "5f092acccd2938050e3d5ed5",
 *                 "fullName": "User 00"
 *               },
 *               "room": {
 *                 "_id": "5f0c3af577f81f0897b0b7a6",
 *                 "name": "User 001",
 *                 "shareUrl": "http://localhost:8100/abd-ewwe-sds",
 *                 "settings": {
 *                   "muteOnStart": false,
 *                   "requireModeratorApprove": false,
 *                   "anyUserCanStart": false,
 *                   "anyUserCanJoinAsModerator": false
 *                 },
 *                 "accessCode": "dr2je4",
 *               }
 *             }
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
 *                 "msg": "User event id is invalid",
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
/**
 * @swagger
 * /user-events/{id}:
 *   put:
 *     summary: Update user event
 *     tags:
 *       - User Event
 *     parameters:
 *       - name: id
 *         in: path
 *         description: The user event id
 *         type: string
 *         required: true
 *       - in: body
 *         name: data
 *         type: object
 *         description: The user event information
 *         schema:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *             time:
 *               type: object
 *               properties:
 *                 begin:
 *                   type: string
 *                 end:
 *                   type: string
 *             timezone:
 *               type: string
 *             location:
 *               type: string
 *             description:
 *               type: string
 *             duration:
 *               type: string
 *             settings:
 *               type: object
 *               properties:
 *                 accessCode:
 *                   type: string
 *                 muteOnStart:
 *                   type: boolean
 *                 requireModeratorApprove:
 *                   type: boolean
 *                 anyUserCanStart:
 *                   type: boolean
 *                 anyUserCanJoinAsModerator:
 *                   type: boolean
 *             privacy:
 *               type: string
 *             groups:
 *               type: array
 *               items:
 *                 type: string
 *             courses:
 *               type: array
 *               items:
 *                 type: string
 *           example: {
 *             "name": "Demo event",
 *             "time": {
 *               "begin": "2020-07-20T10:58:45.526Z",
 *               "end": "2020-07-20T11:58:45.526Z",
 *             },
 *             "timezone": "Asia/Ho_Chi_Minh",
 *             "location": "HCMC",
 *             "description": "Demo event description",
 *             "duration": 100,
 *             "settings": {
 *               "accessCode": "111111",
 *               "muteOnStart": false,
 *               "requireModeratorApprove": false,
 *               "anyUserCanStart": false,
 *               "anyUserCanJoinAsModerator": false,
 *             },
 *             "privacy": "CUSTOM",
 *             "groups": [
 *               "5f6c6d8785cb3700b8de9521",
 *             ],
 *             "courses": [
 *               "5f6c6d8785cb3700b8de9522",
 *             ],
 *           }
 *     responses:
 *       200:
 *         description: User event updated
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *           example: {
 *             "success": true,
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
 *                 "msg": "User event id is invalid",
 *                 "param": "id",
 *               },
 *               {
 *                 "value": "",
 *                 "msg": "Event setting mute on start is invalid",
 *                 "param": "settings.muteOnStart",
 *                 "location": "body"
 *               },
 *               {
 *                 "value": "",
 *                 "msg": "Event setting moderator approve is invalid",
 *                 "param": "settings.requireModeratorApprove",
 *                 "location": "body"
 *               },
 *               {
 *                 "value": "",
 *                 "msg": "Event setting any user can start is invalid",
 *                 "param": "settings.anyUserCanStart",
 *                 "location": "body"
 *               },
 *               {
 *                 "value": "",
 *                 "msg": "Event setting any user can join as moderator is invalid",
 *                 "param": "settings.anyUserCanJoinAsModerator",
 *                 "location": "body"
 *               },
 *               {
 *                 "value": "",
 *                 "msg": "Event name is required",
 *                 "param": "name",
 *                 "location": "body"
 *               },
 *               {
 *                 "value": "",
 *                 "msg": "Begin time is invalid",
 *                 "param": "time.begin",
 *                 "location": "body"
 *               },
 *               {
 *                 "value": "",
 *                 "msg": "End time is invalid",
 *                 "param": "time.end",
 *                 "location": "body"
 *               },
 *               {
 *                 "value": "",
 *                 "msg": "Timezone is invalid",
 *                 "param": "timezone",
 *                 "location": "body"
 *               },
 *               {
 *                 "value": "very long string",
 *                 "msg": "User event description cannot exceed 1000 characters",
 *                 "param": "description",
 *                 "location": "body"
 *               },
 *               {
 *                 "value": "12343",
 *                 "msg": "User event duration cannot larger than 1440",
 *                 "param": "duration",
 *                 "location": "body"
 *               },
 *             ]
 *           }
 *       500:
 *         description: When got server exception
 *         schema:
 *           type: string
 *           example: "Internal server error"
 */
/**
 * @swagger
 * /user-events/{id}:
 *   delete:
 *     summary: Delete event
 *     tags:
 *       - User Event
 *     parameters:
 *       - name: id
 *         in: path
 *         description: The user event id
 *         type: string
 *         required: true
 *     responses:
 *       200:
 *         description: User event deleted
 *         type: object
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *           example: {
 *             success: true,
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
 *                 "msg": "User event id is invalid",
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
    UserEventValidator.getUserEvent,
    isAuthorized(),
    UserEventController.getUserEvent,
  )
  .put(
    UserEventValidator.updateUserEvent,
    isAuthorized(),
    UserEventController.updateUserEvent,
  )
  .delete(
    UserEventValidator.deleteUserEvent,
    isAuthorized(),
    UserEventController.deleteUserEvent,
  );
router.route('/:id/join')
  .get(
    isAuthorized(),
    UserEventController.joinUserEvent,
  );
router.route('/:id/event-detail')
  .get(
    isAuthorized(),
    UserEventController.eventDetail,
  );
router.route('/:id/playback')
  .get(
    isAuthorized(),
    UserEventController.playbackUserEvent,
  );
router.route('/:id/participant')
  .get(
    isAuthorized(),
    UserEventController.reportParticipantUserEvent,
  );
router.route('/:id/histories')
  .get(
    isAuthorized(),
    UserEventController.getEventHistories,
  );
export default router;
