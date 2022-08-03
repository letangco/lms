import { Router } from 'express';
import * as UserController from './userRole.controller';
import { isAuthorized } from '../../api/auth.middleware';

const router = new Router();

/**
 * @swagger
 * /user-roles:
 *   get:
 *     summary: Get all user roles
 *     tags:
 *       - UserRole
 *     responses:
 *       200:
 *         description: The user roles
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *             payload:
 *               type: object
 *               properties:
 *                 type: string
 *           example: {
 *             success: true,
 *             payload: {
 *               "Administrator": "Administrator",
 *               "Instructor": "Instructor",
 *               "Learner": "Learner",
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
  .get(
    isAuthorized(),
    UserController.getUserRoles,
  );

export default router;
