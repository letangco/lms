import { Router } from 'express';
import * as GroupValidator from './courseGroup.validator';
import * as GroupController from './courseGroup.controller';
import { isAuthorized } from '../../api/auth.middleware';

const router = new Router();

/**
 * @swagger
 * /user-course-groups:
 *   get:
 *     summary: Get user groups
 *     tags:
 *       - Group Course
 *     parameters:
 *       - name: group
 *         in: query
 *         description: Group Id
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
 *         description: Search by user name
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
 *                    "firstName": "First name",
 *                    "lastName": "Last name",
 *                    "fullName": "Full name",
 *                    "email": "instructor@mail.com"
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
 *               {
 *                 "msg": "Group id is invalid",
 *                 "param": "group",
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
    GroupValidator.getUserGroups,
    isAuthorized(),
    GroupController.getUserGroups,
  );

/**
 * @swagger
 * /user-course-groups:
 *   post:
 *     summary: Add user to course group
 *     tags:
 *       - Group Course
 *     parameters:
 *       - name: body
 *         in: body
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             user:
 *               type: string
 *             group:
 *               type: string
 *             type:
 *               type: string
 *           example: {
 *             "user": "60421913582070092a398322",
 *             "group": "60421913582070092a398322",
 *             "type": "CAPTION"
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
 *                 user:
 *                   type: string
 *                 group:
 *                   type: string
 *                 type:
 *                   type: string
 *           example: {
 *              success: true,
 *              payload: {
 *                "_id": "60421913582070092a398322",
 *                "user": "60421913582070092a398322",
 *                "group": "60421913582070092a398322",
 *                "type": "CAPTAIN"
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
 *                 "msg": "Group id is invalid",
 *                 "param": "group",
 *               },
 *               {
 *                 "msg": "User id is invalid",
 *                 "param": "user",
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
    GroupValidator.createUserGroup,
    isAuthorized(),
    GroupController.createUserGroup,
  );

/**
 * @swagger
 * /user-course-groups/{id}:
 *   put:
 *     summary: Update user group
 *     tags:
 *       - Group Course
 *     parameters:
 *       - name: id
 *         in: path
 *         description: The user group id
 *         type: string
 *       - name: body
 *         in: body
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             user:
 *               type: string
 *             group:
 *               type: string
 *             type:
 *               type: string
 *           example: {
 *             "user": "60421913582070092a398322",
 *             "group": "60421913582070092a398322",
 *             "type": "CAPTION"
 *           }
 *     responses:
 *       200:
 *         description: The group updated
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
 *                 "msg": "User group id is invalid",
 *                 "param": "id",
 *               },
 *               {
 *                 "msg": "Group id is invalid",
 *                 "param": "group",
 *               },
 *               {
 *                 "msg": "User id is invalid",
 *                 "param": "user",
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
    GroupValidator.updateUsesGroup,
    isAuthorized(),
    GroupController.updateUserGroup,
  );

/**
 * @swagger
 * /user-course-groups/{id}:
 *   delete:
 *     summary: Delete user group
 *     tags:
 *       - Group Course
 *     parameters:
 *       - name: id
 *         in: path
 *         description: The user group id
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
 *                 "msg": "User group id is invalid",
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
    GroupValidator.deleteUserGroup,
    isAuthorized(),
    GroupController.deleteUserGroup,
  );

export default router;
