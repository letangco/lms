import { Router } from 'express';
import * as ChatMessageController from './chatMessage.controller';
import * as ChatMessageValidator from './chatMessage.validator';
import * as ChatMessageMulter from './chatMessage.multer';
import { isAuthorized } from '../../api/auth.middleware';
import { multerBodyParser } from '../../api/multerBodyParser.middleware';

const router = new Router();

/**
 * @swagger
 * /chat/messages/{group}:
 *   get:
 *     summary: Get group's messages. Do not provide both firstId and lastId on same request.
 *     tags:
 *       - Chat Message
 *     parameters:
 *       - in: path
 *         name: group
 *         type: string
 *         description: The user's group want to get messages
 *       - name: firstId
 *         in: query
 *         description: The first id of current messages list on client, the messages response will newer than the current newest message
 *         type: string
 *       - name: lastId
 *         in: query
 *         description: The last id of current messages list on client, the messages response will older than the current oldest message
 *         type: string
 *       - name: rowPerPage
 *         in: query
 *         description: The rowPerPage want to load
 *         type: string
 *     responses:
 *       200:
 *         description: The group's messages
 *         schema:
 *           type: object
 *           example: {
 *             success: true,
 *             payload: [
 *               {
 *                 _id: '5d77119b14efe2474c1d1f',
 *                 type: 'MESSAGE',
 *                 sender: {
 *                   _id: '5d77119b14efe2474c1d1f',
 *                   fullName: 'User name',
 *                   avatar: 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y',
 *                 },
 *                 group: "5dfa6f57cacbf406355e7cf6",
 *                 content: {
 *                   text: "Hello world"
 *                 },
 *                 createdAt: '2019-12-10 04:59:45.251Z',
 *               }
 *             ],
 *           }
 *       404:
 *         description: User group not found
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
 *                 "value": "invalid ticket",
 *                 "msg": "Ticket id is invalid",
 *                 "param": "ticket",
 *                 "location": "query"
 *               },
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
 *               }
 *             ]
 *           }
 *       500:
 *         description: When got server exception
 *         schema:
 *           type: string
 *           example: "Internal server error"
 */
router.route('/messages/:group')
  .get(
    ChatMessageValidator.getUserGroupMessages,
    isAuthorized(),
    ChatMessageController.getUserGroupMessages,
  );

/**
 * @swagger
 * /chat/messages/{group}:
 *   post:
 *     summary: Create message
 *     tags:
 *       - Chat Message
 *     parameters:
 *       - name: group
 *         in: path
 *         required: true
 *         description: The chat group id
 *       - in: formData
 *         name: message-files
 *         type: file
 *         description: The message files
 *       - in: formData
 *         name: data
 *         type: object
 *         description: The body stringify information
 *         schema:
 *           type: object
 *           properties:
 *             content:
 *               type: object
 *               properties:
 *                 text:
 *                   type: string
 *           example: {
 *             content: {
 *               text: "Hello, i need support",
 *             }
 *           }
 *     responses:
 *       200:
 *         description: Message created
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *           example: {
 *             "success": true,
 *           }
 *       404:
 *         description: User ticket not found
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
 *                 "msg": "Chat group id is invalid",
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
router.route('/messages/:group')
  .post(
    isAuthorized(),
    ChatMessageMulter.messageFileUploader,
    multerBodyParser,
    ChatMessageValidator.addMessage,
    ChatMessageController.addMessage,
  );

export default router;
