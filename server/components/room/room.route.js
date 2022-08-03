import { Router } from 'express';
import * as RoomValidator from './room.validator';
import * as RoomController from './room.controller';
import { isAuthorized } from '../../api/auth.middleware';

const router = new Router();

/**
 * @swagger
 * /rooms/{id}/join:
 *   get:
 *     summary: Get room join url
 *     tags:
 *       - Room
 *     parameters:
 *       - name: id
 *         in: path
 *         description: The user event id
 *         type: string
 *       - name: accessCode
 *         in: query
 *         description: The access code id to join meeting
 *         type: string
 *     responses:
 *       200:
 *         description: The join url
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *             payload:
 *               type: string
 *               description: The join url
 *               example: https://host.com/html5client/sessionToken=abc2313
 *       401:
 *         description: Unauthorized
 *         schema:
 *           type: string
 *           example: Unauthorized
 *       403:
 *         description: When data cannot be process
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
 *                 "msg": "User and user event is required",
 *                 "param": "userAndUserEventIsRequired",
 *               },
 *               {
 *                 "msg": "The access code is not match",
 *                 "param": "accessCodeNotMatch",
 *               },
 *               {
 *                 "msg": "Permission denied",
 *                 "param": "permissionDenied",
 *               },
 *               {
 *                 "msg": "User full name is required",
 *                 "param": "userFullNameIsRequired",
 *               },
 *               {
 *                 msg: 'Meeting not found',
 *                 param: 'meetingNotFound',
 *               },
 *               {
 *                 msg: 'Meeting is not valid',
 *                 param: 'meetingNotValid',
 *               },
 *               {
 *                 msg: 'Join URL not found',
 *                 param: 'joinUrlNotFound',
 *               },
 *             ]
 *           }
 *       404:
 *         description: When room not found
 *         schema:
 *           type: string
 *           example: "User event not found"
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
 *                 value: "",
 *                 msg: "Event id is not valid",
 *                 param: "id",
 *                 location: "params"
 *               },
 *               {
 *                 value: "12345",
 *                 msg: "Room access code must be 6 chars",
 *                 param: "accessCode",
 *                 location: "query"
 *               },
 *             ]
 *           }
 *       500:
 *         description: When got server exception
 *         schema:
 *           type: string
 *           example: "Internal server error"
 */

router.route('/:id/join')
  .get(
    RoomValidator.getJoinUrl,
    isAuthorized(),
    RoomController.getJoinUrl,
  );

router.route('/hook')
  .post(
    RoomController.callRoomHook,
  );

router.route('/hook/recorded')
  .post(
    RoomController.callRoomRecordedHook,
  );

export default router;
