import { Router } from 'express';
import * as GroupValidator from './courseGroup.validator';
import * as GroupController from './courseGroup.controller';
import { isAuthorized } from '../../api/auth.middleware';

const router = new Router();

/**
 * @swagger
 * /course-groups:
 *   get:
 *     summary: Get groups
 *     tags:
 *       - Group Course
 *     parameters:
 *       - name: course
 *         in: query
 *         description: Course Id
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
 *         description: Search by group name
 *         type: string
 *     responses:
 *       200:
 *         description: The groups data
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *             payload:
 *               type: array
 *               items:
 *                 $ref: '#/definitions/Group'
 *           example: {
 *              success: true,
 *              "payload": {
 *                "data": [
 *                  {
 *                    "_id": "60421913582070092a398322",
 *                    "name": "High school",
 *                    "description": "High school group",
 *                    "key": "randomKey1",
 *                    "status": "ACTIVE",
 *                    "course": {}
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
 *                 "msg": "Page number must be a positive integer",
 *                 "param": "page",
 *               },
 *               {
 *                 "msg": "Row per page must be a positive integer not larger than 200",
 *                 "param": "rowPerPage",
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
  .get(
    GroupValidator.getGroups,
    isAuthorized(),
    GroupController.getGroups,
  );

/**
 * @swagger
 * /course-groups/{id}:
 *   get:
 *     summary: Get group
 *     tags:
 *       - Group Course
 *     parameters:
 *       - name: id
 *         in: path
 *         description: The group id
 *         type: string
 *         required: true
 *     responses:
 *       200:
 *         description: The group data
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *             payload:
 *               type: object
 *               $ref: '#/definitions/Group'
 *           example: {
 *              success: true,
 *              payload: {
 *                _id: "60421913582070092a398322",
 *                name: "High school",
 *                description: "High school group",
 *                status: "ACTIVE",
 *                key: "randomKey1",
 *                course: {},
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
 *           example: Group not found
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
 *                 "msg": "Group id is invalid",
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
    GroupValidator.getGroup,
    isAuthorized(),
    GroupController.getGroup,
  );

/**
 * @swagger
 * /course-groups:
 *   post:
 *     summary: Create group
 *     tags:
 *       - Group Course
 *     parameters:
 *       - name: body
 *         in: body
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *             description:
 *               type: string
 *             course:
 *               type: string
 *             key:
 *               type: string
 *           example: {
 *             "name": "High school",
 *             "description": "High school group",
 *             "course": "60421913582070092a398322",
 *             "key": "randomKey1"
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
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 description:
 *                   type: string
 *                 course:
 *                   type: string
 *                 key:
 *                   type: string
 *                 status:
 *                   type: string
 *           example: {
 *              success: true,
 *              payload: {
 *                "_id": "60421913582070092a398322",
 *                "name": "High school",
 *                "description": "High school group",
 *                "course": "60421913582070092a398322",
 *                "key": "randomKey1",
 *                "status": "ACTIVE"
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
 *                 "msg": "Group name cannot exceed 100 characters",
 *                 "param": "name",
 *               },
 *               {
 *                 "msg": "Group description cannot exceed 1000 characters",
 *                 "param": "description",
 *               },
 *               {
 *                 "msg": "Group key must be a slug with maximum 20 characters",
 *                 "param": "key",
 *               },
 *               {
 *                 "msg": "Course id is invalid",
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
    GroupValidator.createGroup,
    isAuthorized(),
    GroupController.createGroup,
  );

/**
 * @swagger
 * /course-groups/{id}:
 *   put:
 *     summary: Update group
 *     tags:
 *       - Group Course
 *     parameters:
 *       - name: id
 *         in: path
 *         description: The group id
 *         type: string
 *       - name: body
 *         in: body
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *             description:
 *               type: string
 *             course:
 *               type: string
 *             key:
 *               type: string
 *             status:
 *               type: string
 *           example: {
 *             "name": "High school",
 *             "description": "High school group",
 *             "course": "60421913582070092a398322",
 *             "key": "randomKey1",
 *             "status": "INACTIVE",
 *           }
 *     responses:
 *       200:
 *         description: The group updated
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
 *                 description:
 *                   type: string
 *                 course:
 *                   type: string
 *                 key:
 *                   type: string
 *                 status:
 *                   type: string
 *           example: {
 *              success: true,
 *              payload: {
 *                "_id": "60421913582070092a398322",
 *                "name": "High school",
 *                "description": "High school group",
 *                "course": "60421913582070092a398322",
 *                "key": "randomKey1",
 *                "status": "INACTIVE",
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
 *                 "msg": "Group id is invalid",
 *                 "param": "id",
 *               },
 *               {
 *                 "msg": "Group name cannot exceed 100 characters",
 *                 "param": "name",
 *               },
 *               {
 *                 "msg": "Group description cannot exceed 1000 characters",
 *                 "param": "description",
 *               },
 *               {
 *                 "msg": "Course id is invalid",
 *                 "param": "course",
 *               },
 *               {
 *                 "msg": "Group key must be a slug with maximum 20 characters",
 *                 "param": "key",
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
    GroupValidator.updateGroup,
    isAuthorized(),
    GroupController.updateGroup,
  );

/**
 * @swagger
 * /course-groups/{id}:
 *   delete:
 *     summary: Delete group
 *     tags:
 *       - Group Course
 *     parameters:
 *       - name: id
 *         in: path
 *         description: The group id
 *         type: string
 *     responses:
 *       200:
 *         description: The group deleted
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
 *                 "msg": "Group id is invalid",
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
    GroupValidator.deleteGroup,
    isAuthorized(),
    GroupController.deleteGroup,
  );

export default router;
