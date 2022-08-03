import { Router } from 'express';
import * as UserTypeUnitController from './userTypeUnit.controller';
import * as UserTypeUnitValidator from './userTypeUnit.validator';
import { isAuthorized } from '../../api/auth.middleware';

const router = new Router();

/**
 * @swagger
 * /user-type-units:
 *   get:
 *     summary: Get user type units
 *     tags:
 *       - UserTypeUnit
 *     responses:
 *       200:
 *         description: The user type units
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *             payload:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   $ref: '#/definitions/UserTypeUnit'
 *           example: {
 *             success: true,
 *             payload: []
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
  .get(
    isAuthorized(),
    UserTypeUnitController.getUserTypeUnits,
  );

/**
 * @swagger
 * /user-type-units:
 *   post:
 *     summary: Create new user type unit
 *     tags:
 *       - UserTypeUnit
 *     parameters:
 *       - name: body
 *         in: body
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *             role:
 *               type: string
 *             routes:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   method:
 *                     type: string
 *                   route:
 *                     type: string
 *                   role:
 *                     type: string
 *             parent:
 *               type: objectId
 *             status:
 *               type: string
 *           example: {
 *             "name": "Create user",
 *             "role": "ADMIN",
 *             "routes": [
 *               {
 *                 "method" : "GET",
 *                 "route" : "users",
 *                 "role" : "ADMIN",
 *               },
 *             ],
 *             "parent": "60421913582070092a398321",
 *             "status": "ACTIVE",
 *           }
 *     responses:
 *       200:
 *         description: The new user type unit
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *             payload:
 *               type: object
 *               properties:
 *                 $ref: '#/definitions/UserTypeUnit'
 *           example: {
 *             success: true,
 *             payload: {}
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
    UserTypeUnitValidator.createUserTypeUnit,
    UserTypeUnitController.createUserTypeUnit,
  );

/**
 * @swagger
 * /user-type-units/{id}:
 *   put:
 *     summary: Update user type unit
 *     tags:
 *       - UserTypeUnit
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
 *             role:
 *               type: string
 *             routes:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   method:
 *                     type: string
 *                   route:
 *                     type: string
 *                   role:
 *                     type: string
 *             parent:
 *               type: objectId
 *             status:
 *               type: string
 *           example: {
 *             "name": "Create user",
 *             "role": "ADMIN",
 *             "routes": [
 *               {
 *                 "method" : "GET",
 *                 "route" : "users",
 *                 "role" : "ADMIN",
 *               },
 *             ],
 *             "parent": "60421913582070092a398321",
 *             "status": "ACTIVE",
 *           }
 *     responses:
 *       200:
 *         description: The user type unit updated
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *             payload:
 *               type: object
 *               properties:
 *                 $ref: '#/definitions/UserTypeUnit'
 *           example: {
 *             success: true,
 *             payload: {}
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
/**
 * @swagger
 * /user-type-units/{id}:
 *   delete:
 *     summary: Delete user type unit
 *     tags:
 *       - UserTypeUnit
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: The user type unit deleted
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
 *       500:
 *         description: When got server exception
 *         schema:
 *           type: string
 *           example: "Internal server error"
 */
router.route('/:id')
  .put(
    isAuthorized(),
    UserTypeUnitValidator.updateUserTypeUnit,
    UserTypeUnitController.updateUserTypeUnit,
  )
  .delete(
    isAuthorized(),
    UserTypeUnitValidator.deleteUserTypeUnit,
    UserTypeUnitController.deleteUserTypeUnit,
  );

export default router;
