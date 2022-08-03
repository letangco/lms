import { Router } from 'express';
import * as ChatGroupController from './chatGroup.controller';
import * as ChatGroupValidator from './chatGroup.validator';
import { isAuthorized } from '../../api/auth.middleware';

const router = new Router();

/**
 * @swagger
 * /chat/groups:
 *   get:
 *     summary: Get user chat groups
 *     tags:
 *       - Chat Group
 *     parameters:
 *       - name: firstTime
 *         in: query
 *         description: The first time of current groups list on client, the groups response will newer than the current newest group
 *         type: string
 *       - name: lastTime
 *         in: query
 *         description: The last time of current groups list on client, the groups response will older than the current oldest group
 *         type: string
 *       - name: textSearch
 *         in: query
 *         description: Search group by group name or user's name on group
 *         type: string
 *       - name: rowPerPage
 *         in: query
 *         description: The rowPerPage want to load
 *         type: string
 *       - name: type
 *         in: query
 *         description: The type to load, COURSE or USER
 *         type: string
 *     responses:
 *       200:
 *         description: The user chat groups
 *         schema:
 *           type: object
 *           example: {
 *             success: true,
 *             payload: [
 *               {
 *                 _id: '5d77119b14efe2474c1d1f',
 *                 name: "Group name",
 *                 members: [
 *                   {
 *                     "_id": "5dee243f97bca20281c0583b",
 *                     "fullName": "John Smith",
 *                     "avatar": "https://www.gravatar.com/avatar/00000000000000000000000000000000",
 *                     "unread": 2,
 *                   },
 *                   {
 *                     "_id": "5def1b40dd7f7d03c7630165",
 *                     "fullName": "Nhan Nguyen",
 *                     "avatar": "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y",
 *                     "unread": 2,
 *                   }
 *                 ],
 *                 "lastMessage": {
 *                   "type": "MESSAGE",
 *                   "_id": "5df8a2bf39954100ae3c33ff",
 *                   "sender": {
 *                     _id: '5d77119b14efe2474c1d1f',
 *                     uuid: 'uuid',
 *                     fullName: 'User name',
 *                     avatar: 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y',
 *                   },
 *                   "group": "5def2641ee1e15049a4c8131",
 *                   "body": "You: Hello",
 *                   "payload": {
 *                     "files": [
 *                       {
 *                         "originalname": "Screen Shot 00.png",
 *                         "filename": "screen-shot-00-1569493513707.png",
 *                         "url": "/uploads/messages/01-12-2019/5def2641ee1e15049a4c8131/screen-shot-00-1569493513707.png",
 *                         "size": 109262
 *                       }
 *                     ],
 *                     "text": "Hello"
 *                   },
 *                   "createdAt": "2019-12-17T09:41:19.189Z"
 *                 }
 *               }
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
 *                 "value": "firstTime",
 *                 "msg": "First time must be date string",
 *                 "param": "firstTime",
 *                 "location": "query"
 *               },
 *               {
 *                 "value": "lastTime",
 *                 "msg": "Last time must be date string",
 *                 "param": "lastTime",
 *                 "location": "query"
 *               },
 *               {
 *                 "value": "abc",
 *                 "msg": "Row per page must be a number",
 *                 "param": "rowPerPage",
 *                 "location": "query"
 *               },
 *               {
 *                 "value": "type",
 *                 "msg": "Chat group type to load is invalid",
 *                 "param": "type",
 *                 "location": "query"
 *               }
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
 * /chat/groups:
 *   post:
 *     summary: Create new group
 *     tags:
 *       - Chat Group
 *     parameters:
 *       - in: body
 *         name: body
 *         type: object
 *         schema:
 *           properties:
 *             users:
 *               type: array
 *               items:
 *                 type: string
 *               description: The users _id
 *           description: The users of this group, users _id
 *           example: {
 *             users: [
 *               "6051ddd72c6bba0313baa34f",
 *             ],
 *           }
 *     responses:
 *       200:
 *         description: The group created
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *             payload:
 *               $ref: '#/definitions/ChatGroup'
 *           example: {
 *             success: true,
 *             payload: {
 *               _id: '5def2641ee1e15049a4c8131',
 *               name: "Group name",
 *               members: [
 *                 {
 *                   "_id": {
 *                     _id: "5dee243f97bca20281c0583b",
 *                     "fullName": "John Smith",
 *                     "avatar": "https://www.gravatar.com/avatar/00000000000000000000000000000000",
 *                   },
 *                   "unread": 2,
 *                 },
 *                 {
 *                   "_id": {
 *                     _id: "5def1b40dd7f7d03c7630165",
 *                     "fullName": "Nhan Nguyen",
 *                     "avatar": "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y",
 *                   },
 *                   "unread": 2,
 *                 }
 *               ],
 *             }
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
 *                 msg: 'Users must be a list of user id',
 *                 param: 'users',
 *                 location: 'body'
 *               },
 *             ]
 *           }
 *       500:
 *         description: When got server exception
 */
router.route('/groups')
  .get(
    ChatGroupValidator.getUserGroups,
    isAuthorized(),
    ChatGroupController.getUserGroups,
  )
  .post(
    ChatGroupValidator.createGroup,
    isAuthorized(),
    ChatGroupController.createGroup,
  );

/**
 * @swagger
 * /chat/groups/{id}:
 *   put:
 *     summary: Update message group
 *     tags:
 *       - Chat Group
 *     parameters:
 *       - name: id
 *         in: path
 *         description: The message group id
 *         type: string
 *       - in: body
 *         name: body
 *         description: The group data to update
 *         type: object
 *         schema:
 *           properties:
 *             name:
 *               type: string
 *           example: {
 *             name: "New group name",
 *           }
 *     responses:
 *       200:
 *         description: Message group updated
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *             payload:
 *               $ref: '#/definitions/ChatGroup'
 *           example: {
 *             success: true,
 *             payload: {
 *               _id: '5d77119b14efe2474c1d1f',
 *               name: "New group name",
 *             }
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
 *                 msg: 'Group id is invalid',
 *                 param: 'id',
 *                 location: 'params'
 *               },
 *               {
 *                 msg: 'Group name is required',
 *                 param: 'name',
 *                 location: 'body'
 *               },
 *             ]
 *           }
 *       500:
 *         description: When got server exception
 */
router.route('/groups/:id')
  .put(
    ChatGroupValidator.updateGroup,
    isAuthorized(),
    ChatGroupController.updateGroup,
  );

/**
 * @swagger
 * /chat/groups/{id}:
 *   get:
 *     summary: Get message group
 *     tags:
 *       - Chat Group
 *     parameters:
 *       - name: id
 *         in: path
 *         description: The message group id
 *         type: string
 *     responses:
 *       200:
 *         description: Message group info
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *             payload:
 *               $ref: '#/definitions/ChatGroup'
 *           example: {
 *             success: true,
 *             payload: {
 *               _id: '5d77119b14efe2474c1d1f',
 *               name: "New group name",
 *             }
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
 *                 msg: 'Group id is invalid',
 *                 param: 'id',
 *                 location: 'params'
 *               },
 *             ]
 *           }
 *       500:
 *         description: When got server exception
 */
router.route('/groups/:id')
  .get(
    ChatGroupValidator.getUserGroup,
    isAuthorized(),
    ChatGroupController.getUserGroup,
  );

/**
 * @swagger
 * /chat/groups/{id}/reset-unread:
 *   post:
 *     summary: Reset number unread message of user on this group
 *     tags:
 *       - Chat Group
 *     parameters:
 *       - name: id
 *         in: path
 *         description: The message group id want to reset
 *         type: string
 *     responses:
 *       200:
 *         description: Reset number unread message of user on this group success
 *         schema:
 *           type: object
 *           example: {
 *             success: true,
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
 *                 "value": "group",
 *                 "msg": "Group id is invalid",
 *                 "param": "group",
 *                 "location": "params"
 *               },
 *             ]
 *           }
 *       500:
 *         description: When got server exception
 *         schema:
 *           type: string
 *           example: "Internal server error"
 */

router.route('/groups/:id/reset-unread')
  .post(
    ChatGroupValidator.resetUnreadMessage,
    isAuthorized(),
    ChatGroupController.resetUnreadMessage,
  );

export default router;
