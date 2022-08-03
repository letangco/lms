import { Router } from 'express';
import * as CourseUserValidator from './courseUser.validator';
import * as CourseUserController from './courseUser.controller';
import { isAuthorized } from '../../api/auth.middleware';

const router = new Router();

/**
 * @swagger
 * /course-users/{id}/users:
 *   get:
 *     summary: Get course users
 *     tags:
 *       - Course User
 *     parameters:
 *       - name: id
 *         in: path
 *         description: The course id
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
 *         description: The course users data
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *             payload:
 *               type: array
 *               data:
 *                 $ref: '#/definitions/CourseUser'
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
 *                 "msg": "Course id is invalid",
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
router.route('/:id/users')
  .get(
    CourseUserValidator.getCourseUsers,
    isAuthorized(),
    CourseUserController.getCourseUsers,
  );

/**
 * @swagger
 * /course-users/search-course-users:
 *   get:
 *     summary: Search course users. Do not provide both firstId and lastId on same request.
 *     tags:
 *       - Course User
 *     parameters:
 *       - name: courseId
 *         in: query
 *         description: The course id
 *         type: string
 *       - name: firstId
 *         in: query
 *         description: The first id of current users list on client, the users response will newer than the current newest user
 *         type: string
 *       - name: lastId
 *         in: query
 *         description: The last id of current users list on client, the users response will older than the current oldest user
 *         type: string
 *       - name: rowPerPage
 *         in: query
 *         description: The rowPerPage want to load
 *         type: string
 *       - name: textSearch
 *         in: query
 *         description: The textSearch search by user fullName
 *         type: string
 *       - name: roles
 *         in: query
 *         type: string
 *         description: User roles
 *     responses:
 *       200:
 *         description: The users
 *         schema:
 *           type: object
 *           example: {
 *             success: true,
 *             payload: [
 *               {
 *                 _id: '6049e9228e62941b2dc3a578',
 *                 fullName: 'Example User'
 *               }
 *             ],
 *           }
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
 *                 msg: 'Please provide only firstId or only lastId to get message',
 *                 param: 'firstIdConflictLastId',
 *                 location: 'query',
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
 *                 "value": "courseId",
 *                 "msg": "Course id is invalid",
 *                 "param": "courseId",
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
 *               },
 *               {
 *                 "value": "abc",
 *                 "msg": "User role is not valid",
 *                 "param": "roles[0]",
 *                 "location": "query"
 *               },
 *             ]
 *           }
 *       500:
 *         description: When got server exception
 *         schema:
 *           type: string
 *           example: "Internal server error"
 */

router.route('/search-course-users')
  .get(
    CourseUserValidator.searchCourseUsers,
    isAuthorized(),
    CourseUserController.searchCourseUsers,
  );

/**
 * @swagger
 * /course-users:
 *   post:
 *     summary: Create course user
 *     tags:
 *       - Course User
 *     parameters:
 *       - name: body
 *         in: body
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             course:
 *               type: string
 *             user:
 *               type: string
 *           example: {
 *             "course": "60421913582070092a398322",
 *             "user": "60421913582070092a398323",
 *           }
 *     responses:
 *       200:
 *         description: The course user created
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
 *                 course:
 *                   type: string
 *                 user:
 *                   type: string
 *                 userRole:
 *                   type: string
 *           example: {
 *              success: true,
 *              payload: {
 *                "_id": "6051d3f44c3d0002db5ce7e4",
 *                "creator": "6045e1c6f0fd1d0cbc504cfc",
 *                "course": "60519a0cc55c0307c516af43",
 *                "user": {
 *                  "status": "ACTIVE",
 *                  "_id": "6045e1c6f0fd1d0cbc504cfc",
 *                  "firstName": "Exadm",
 *                  "lastName": "ple",
 *                  "username": "nhannguyen",
 *                  "fullName": "Exadm ple"
 *                },
 *                "userRole": "LEARNER"
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
 *                 "msg": "User already assign to course",
 *                 "param": "userAssigned",
 *               },
 *               {
 *                 "msg": "User not found",
 *                 "param": "userNotFound",
 *               },
 *               {
 *                 "msg": "User role is invalid",
 *                 "param": "userRoleInvalid",
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
 *                 "msg": "Course id is invalid",
 *                 "param": "course",
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
    CourseUserValidator.createCourseUser,
    isAuthorized(),
    CourseUserController.createCourseUser,
  );

/**
 * @swagger
 * /course-users/{id}:
 *   put:
 *     summary: Update course user
 *     tags:
 *       - Course User
 *     parameters:
 *       - name: id
 *         in: path
 *         description: The course user id
 *         type: string
 *       - name: user
 *         in: path
 *         description: The user id
 *         type: string
 *       - name: body
 *         in: body
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             userRole:
 *               type: string
 *           example: {
 *             "userRole": "LEARNER",
 *           }
 *     responses:
 *       200:
 *         description: The course user updated
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
 *                 "msg": "Course user not found",
 *                 "param": "courseUserNotFound",
 *               },
 *               {
 *                 "msg": "User not found",
 *                 "param": "userNotFound",
 *               },
 *               {
 *                 "msg": "User role is invalid",
 *                 "param": "userRoleInvalid",
 *               },
 *             ]
 *           }
 *       404:
 *         description: Not found
 *         schema:
 *           type: string
 *           example: User not found, Course not found
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
 *                 "msg": "Course id is invalid",
 *                 "param": "id",
 *               },
 *               {
 *                 "msg": "User role is invalid",
 *                 "param": "userRole",
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
    CourseUserValidator.updateCourseUser,
    isAuthorized(),
    CourseUserController.updateCourseUser,
  );

/**
 * @swagger
 * /course-users/{id}:
 *   delete:
 *     summary: Delete course user
 *     tags:
 *       - Course User
 *     parameters:
 *       - name: id
 *         in: path
 *         description: The course user id
 *         type: string
 *     responses:
 *       200:
 *         description: The course user deleted
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
 *                 "msg": "Course user id is invalid",
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
    CourseUserValidator.deleteCourseUser,
    isAuthorized(),
    CourseUserController.deleteCourseUser,
  );

export default router;
