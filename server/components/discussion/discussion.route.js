import { Router } from 'express';
import * as DiscussionValidator from './discussion.validator';
import * as DiscussionController from './discussion.controller';
import { isAuthorized } from '../../api/auth.middleware';

const router = new Router();

/**
 * @swagger
 * /discussions:
 *   get:
 *     summary: Get discussions
 *     tags:
 *       - Discussion
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
 *         description: Search by course name
 *         type: string
 *       - name: parent
 *         in: query
 *         description: search reply of discussion
 *         type: string
 *       - name: creator
 *         in: query
 *         description: search by creator
 *         type: string
 *       - name: course
 *         in: query
 *         description: search by course
 *         type: string
 *       - name: unit
 *         in: query
 *         description: search by unit
 *         type: string
 *       - name: group
 *         in: query
 *         description: search by group
 *         type: string
 *     responses:
 *       200:
 *         description: The discussions data
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
 *                    "name": "High school",
 *                    "message": "High school discussion",
 *                    "group": {},
 *                    "files": [],
 *                    "course": {},
 *                    "unit": {},
 *                    "creator": {},
 *                    "parent": {},
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
    DiscussionValidator.getDiscussions,
    isAuthorized(),
    DiscussionController.getDiscussions,
  );

/**
 * @swagger
 * /discussions/{id}:
 *   get:
 *     summary: Get discussion
 *     tags:
 *       - Discussion
 *     parameters:
 *       - name: id
 *         in: path
 *         description: The discussion id
 *         type: string
 *         required: true
 *     responses:
 *       200:
 *         description: The discussion data
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
 *                "name": "High school",
 *                "message": "High school discussion",
 *                "group": {},
 *                "files": [],
 *                "course": {},
 *                "unit": {},
 *                "creator": {},
 *                "parent": {},
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
 *           example: Discussion not found
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
 *                 "msg": "Discussion id is invalid",
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
    DiscussionValidator.getDiscussion,
    isAuthorized(),
    DiscussionController.getDiscussion,
  );

/**
 * @swagger
 * /discussions:
 *   post:
 *     summary: Create discussion
 *     tags:
 *       - Discussion
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
 *             group:
 *               type: string
 *             course:
 *               type: string
 *             unit:
 *               type: string
 *             files:
 *               type: array
 *             parent:
 *               type: string
 *           example: {
 *             "name": "High school",
 *             "message": "High school discussion",
 *             "group": "",
 *             "course": "60421913582070092a398322",
 *             "unit": "60421913582070092a398322",
 *             "parent": "60421913582070092a398322",
 *             "file": ["60421913582070092a398322", "60421913582070092a398312"]
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
 *                 name:
 *                   type: string
 *                 message:
 *                   type: string
 *                 group:
 *                   type: string
 *                 course:
 *                   type: string
 *                 unit:
 *                   type: string
 *                 files:
 *                   type: array
 *                 parent:
 *                   type: string
 *           example: {
 *              success: true,
 *              payload: {
 *                "_id": "60421913582070092a398322",
 *                "name": "High school",
 *                "message": "High school discussion",
 *                "group": {},
 *                "course": {},
 *                "unit": {},
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
 *                 "msg": "Discussion name cannot exceed 100 characters",
 *                 "param": "name",
 *               },
 *               {
 *                 "msg": "Discussion message cannot exceed 1000 characters",
 *                 "param": "message",
 *               },
 *               {
 *                 "msg": "Course is required",
 *                 "param": "course",
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
    DiscussionValidator.createDiscussion,
    isAuthorized(),
    DiscussionController.createDiscussion,
  );

/**
 * @swagger
 * /discussions/{id}:
 *   put:
 *     summary: Update discussion
 *     tags:
 *       - Discussion
 *     parameters:
 *       - name: id
 *         in: path
 *         description: The discussion id
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
 *             "name": "High school",
 *             "message": "High school discussion",
 *             "files": ["60421913582070092a398322", "60421913582070092a398312"],
 *             "status": "INACTIVE"
 *           }
 *     responses:
 *       200:
 *         description: The discussion updated
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
 *                 "msg": "Discussion id is invalid",
 *                 "param": "id",
 *               },
 *               {
 *                 "msg": "Discussion name cannot exceed 100 characters",
 *                 "param": "name",
 *               },
 *               {
 *                 "msg": "Discussion message cannot exceed 1000 characters",
 *                 "param": "message",
 *               },
 *               {
 *                 "msg": "Course is required",
 *                 "param": "course",
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
    DiscussionValidator.updateDiscussion,
    isAuthorized(),
    DiscussionController.updateDiscussion,
  );

/**
 * @swagger
 * /discussions/{id}:
 *   delete:
 *     summary: Delete discussion
 *     tags:
 *       - Discussion
 *     parameters:
 *       - name: id
 *         in: path
 *         description: The discussion id
 *         type: string
 *     responses:
 *       200:
 *         description: The discussion deleted
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
 *                 "msg": "Discussion id is invalid",
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
    DiscussionValidator.deleteDiscussion,
    isAuthorized(),
    DiscussionController.deleteDiscussion,
  );

export default router;
