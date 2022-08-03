import { Router } from 'express';
import * as UserTypeController from './userType.controller';
import * as UserTypeValidator from './userType.validator';
import { isAuthorized } from '../../api/auth.middleware';

const router = new Router();

/**
 * @swagger
 * /user-types:
 *   get:
 *     summary: Get user types
 *     tags:
 *       - UserType
 *     parameters:
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
 *         description: Search by user type name
 *         type: string
 *     responses:
 *       200:
 *         description: The user types
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *             payload:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       $ref: '#/definitions/UserType'
 *                 currentPage:
 *                   type: number
 *                 totalPage:
 *                   type: number
 *                 totalItems:
 *                   type: number
 *           example: {
 *             success: true,
 *             payload: {
 *               "data": [
 *                 {
 *                   _id: "5f092acdfd2938050e3d5ed5",
 *                   name: "Admin 00",
 *                   defaultRole: "Instructor",
 *                 },
 *                 {
 *                   _id: "5f092acdfd2938050e4d5ed6",
 *                   name: "Admin 01",
 *                   defaultRole: "Administrator",
 *                 },
 *               ],
 *               "currentPage": 1,
 *               "totalPage": 1,
 *               "totalItems": 4
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
 *                 "msg": "Page number must be a positive integer",
 *                 "param": "page",
 *               },
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
    isAuthorized(),
    UserTypeValidator.getUserTypes,
    UserTypeController.getUserTypes,
  );

/**
 * @swagger
 * /user-types:
 *   post:
 *     summary: Create new user type
 *     tags:
 *       - UserType
 *     parameters:
 *       - name: body
 *         in: body
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *             defaultRole:
 *               type: string
 *             userTypeUnits:
 *               type: array
 *               items:
 *                 type: string
 *           example: {
 *             "name": "Same Admin",
 *             "defaultRole": "Administrator",
 *             "userTypeUnits": [
 *               "6045f86e1762410f0663d231",
 *               "6045fa5ee605b50f34edc65f",
 *             ],
 *           }
 *     responses:
 *       200:
 *         description: The user type
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *             payload:
 *               type: object
 *               properties:
 *                 $ref: '#/definitions/UserType'
 *           example: {
 *             success: true,
 *             payload: {
 *               "userTypeUnits": [
 *                 "6045f86e1762410f0663d231"
 *               ],
 *               "_id": "6049e9228e62941b2dc3a578",
 *               "name": "Same Admin",
 *               "defaultRole": "Administrator",
 *             }
 *           }
 *       401:
 *         description: Unauthorized
 *         schema:
 *           type: string
 *           example: Unauthorized
 *       500:
 *         description: When got server exception
 *         schema:
 *           type: string
 *           example: "Internal server error"
 */
router.route('/')
  .post(
    isAuthorized(),
    UserTypeValidator.createUserUnit,
    UserTypeController.createUserType,
  );

/**
 * @swagger
 * /user-types/list:
 *   get:
 *     summary: Get list user types. Do not provide both firstId and lastId on same request.
 *     tags:
 *       - UserType
 *     parameters:
 *       - name: firstId
 *         in: query
 *         description: The first id of current user types list on client, the user types response will newer than the current newest user type
 *         type: string
 *       - name: lastId
 *         in: query
 *         description: The last id of current user types list on client, the user types response will older than the current oldest user type
 *         type: string
 *       - name: rowPerPage
 *         in: query
 *         description: The rowPerPage want to load
 *         type: string
 *       - name: textSearch
 *         in: query
 *         description: The textSearch search by user fullName
 *         type: string
 *     responses:
 *       200:
 *         description: The user types
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
 *             ]
 *           }
 *       500:
 *         description: When got server exception
 *         schema:
 *           type: string
 *           example: "Internal server error"
 */

router.route('/list')
  .get(
    UserTypeValidator.getUserTypeList,
    isAuthorized(),
    UserTypeController.getUserTypeList,
  );

/**
 * @swagger
 * /user-types/{id}:
 *   put:
 *     summary: Update user type
 *     tags:
 *       - UserType
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *       - name: body
 *         in: body
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *             defaultRole:
 *               type: string
 *             userTypeUnits:
 *               type: array
 *               items:
 *                 type: string
 *           example: {
 *             "name": "Same Admin",
 *             "defaultRole": "Administrator",
 *             "userTypeUnits": [
 *               "6045f86e1762410f0663d231",
 *               "6045fa5ee605b50f34edc65f",
 *             ],
 *           }
 *     responses:
 *       200:
 *         description: The user type updated
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *             payload:
 *               type: object
 *               properties:
 *                 $ref: '#/definitions/UserType'
 *           example: {
 *             success: true,
 *             payload: {
 *               "userTypeUnits": [
 *                 "6045f86e1762410f0663d231"
 *               ],
 *               "_id": "6049e9228e62941b2dc3a578",
 *               "name": "Same Admin",
 *               "defaultRole": "Administrator",
 *             }
 *           }
 *       304:
 *         description: Not Modified
 *       401:
 *         description: Unauthorized
 *         schema:
 *           type: string
 *           example: Unauthorized
 *       500:
 *         description: When got server exception
 *         schema:
 *           type: string
 *           example: "Internal server error"
 */
/**
 * @swagger
 * /user-types/{id}:
 *   delete:
 *     summary: Delete user type
 *     tags:
 *       - UserType
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         name: body
 *         in: body
 *         required: true
 *         description: User type deleted
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
 *                 "value": "aaa",
 *                 "msg": "User id is invalid",
 *                 "param": "id",
 *                 "location": "param"
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
 * /user-types/{id}:
 *   get:
 *     summary: Get user type
 *     tags:
 *       - UserType
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: The user type
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *             payload:
 *               type: object
 *               properties:
 *                 $ref: '#/definitions/UserType'
 *           example: {
 *             success: true,
 *             payload: {
 *               _id: "5f092acdfd2938050e3d5ed5",
 *               name: "Admin 00",
 *               defaultRole: "Instructor",
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
 *                 "msg": "Page number must be a number minimum is 1",
 *                 "param": "page",
 *               },
 *               {
 *                 "msg": "Row per page must be a number",
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
router.route('/:id')
  .delete(
    isAuthorized(),
    UserTypeValidator.deleteUserType,
    UserTypeController.deleteUserType,
  )
  .put(
    isAuthorized(),
    UserTypeValidator.updateUserType,
    UserTypeController.updateUserType,
  )
  .get(
    isAuthorized(),
    UserTypeValidator.getUserType,
    UserTypeController.getUserType,
  );

export default router;
