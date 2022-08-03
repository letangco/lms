import { Router } from 'express';
import * as DiscussionValidator from './discussion.validator';
import * as DiscussionController from './discussion.controller';
import { isAuthorized } from '../../api/auth.middleware';

const router = new Router();

/**
 * @swagger
 * /discussions-comment:
 *   get:
 *     summary: Get discussion comment by discussion id
 *     tags:
 *       - Discussion Comment
 *     parameters:
 *       - name: lastId
 *         in: query
 *         description: The lastId want to load
 *       - name: firstId
 *         in: query
 *         description: The firstId want to load
 *         type: string
 *       - name: rowPerPage
 *         in: query
 *         description: The rowPerPage want to load
 *         type: string
 *       - name: discussion
 *         in: query
 *         description: search reply of discussion id
 *         type: string
 *       - name: creator
 *         in: query
 *         description: search by creator
 *         type: string
 *     responses:
 *       200:
 *         description: The discussions comment data
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *             payload:
 *               type: array
 *               items:
 *                 $ref: '#/definitions/Discussion'
 *           example: {
 *              success: true,
 *              "payload": {
 *                "data": [
 *                  {
 *                    "_id": "60421913582070092a398322",
 *                    "message": "High school discussion",
 *                    "files": [],
 *                    "createdAt": {},
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
    DiscussionValidator.getDiscussionComments,
    isAuthorized(),
    DiscussionController.getDiscussionComments,
  );

/**
 * @swagger
 * /discussions-comment/{id}:
 *   get:
 *     summary: Get discussion comment
 *     tags:
 *       - Discussion Comment
 *     parameters:
 *       - name: id
 *         in: path
 *         description: The discussion comment id
 *         type: string
 *         required: true
 *     responses:
 *       200:
 *         description: The discussion comment data
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *             payload:
 *               type: object
 *               $ref: '#/definitions/Discussion'
 *           example: {
 *              success: true,
 *              payload: {
 *                "_id": "60421913582070092a398322",
 *                "message": "High school discussion",
 *                "createdAt": {}
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
 *           example: Discussion comment not found
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
 *                 "msg": "Discussion comment id is invalid",
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
    DiscussionValidator.getDiscussionComment,
    isAuthorized(),
    DiscussionController.getDiscussionComment,
  );

/**
 * @swagger
 * /discussions-comment:
 *   post:
 *     summary: Create discussion comment
 *     tags:
 *       - Discussion Comment
 *     parameters:
 *       - name: body
 *         in: body
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *             discussion:
 *               type: string
 *             parent:
 *               type: string
 *             files:
 *               type: array
 *           example: {
 *             "message": "High school discussion",
 *             "discussion": "60421913582070092a398322",
 *             "parent": "60421913582070092a398322",
 *             "files": ["60421913582070092a398322", "60421913582070092a398312"]
 *           }
 *     responses:
 *       200:
 *         description: The discussion created
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
 *                 message:
 *                   type: string
 *                 discussion:
 *                   type: string
 *                 files:
 *                   type: array
 *                 parent:
 *                   type: string
 *           example: {
 *              success: true,
 *              payload: {
 *                "_id": "60421913582070092a398322",
 *                "message": "High school discussion",
 *                "discussion": {},
 *                "parent": {},
 *                "files": [],
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
 *                 "msg": "Discussion comment cannot exceed 10000 characters",
 *                 "param": "message",
 *               },
 *               {
 *                 "msg": "Discussion is required",
 *                 "param": "discussion",
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
    DiscussionValidator.createDiscussionComment,
    isAuthorized(),
    DiscussionController.createDiscussionComment,
  );

/**
 * @swagger
 * /discussions-comment/{id}:
 *   put:
 *     summary: Update discussion comment
 *     tags:
 *       - Discussion Comment
 *     parameters:
 *       - name: id
 *         in: path
 *         description: The discussion comment id
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
 *             files:
 *               type: array
 *           example: {
 *             "_id": "60421913582070092a398322",
 *             "message": "High school discussion",
 *             "files": ["60421913582070092a398322", "60421913582070092a398312"],
 *             "status": "INACTIVE"
 *           }
 *     responses:
 *       200:
 *         description: The discussion comment updated
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
 *                 "msg": "Discussion comment id is invalid",
 *                 "param": "id",
 *               },
 *               {
 *                 "msg": "Discussion comment cannot exceed 10000 characters",
 *                 "param": "message",
 *               },
 *               {
 *                 "msg": "Discussion required",
 *                 "param": "discussion",
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
    DiscussionValidator.updateDiscussionComment,
    isAuthorized(),
    DiscussionController.updateDiscussionComment,
  );

/**
 * @swagger
 * /discussions-comment/{id}:
 *   delete:
 *     summary: Delete discussion comment
 *     tags:
 *       - Discussion Comment
 *     parameters:
 *       - name: id
 *         in: path
 *         description: The discussion comment id
 *         type: string
 *     responses:
 *       200:
 *         description: The discussion comment deleted
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
 *                 "msg": "Discussion comment id is invalid",
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
    DiscussionValidator.deleteDiscussionComment,
    isAuthorized(),
    DiscussionController.deleteDiscussionComment,
  );

export default router;
