import { Router } from 'express';
import * as LocationValidator from './location.validator';
import * as LocationController from './location.controller';
import { isAuthorized } from '../../api/auth.middleware';

const router = new Router();

/**
 * @swagger
 * /user-locations:
 *   get:
 *     summary: Get locations
 *     tags:
 *       - User Location
 *     parameters:
 *       - name: textSearch
 *         in: query
 *         description: text search location
 *         type: string
 *     responses:
 *       200:
 *         description: The locations data
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *             payload:
 *               type: array
 *               items:
 *                 $ref: '#/definitions/Location'
 *           example: {
 *              success: true,
 *              payload: [
 *                {
 *                  "_id": "60421913582070092a398322",
 *                  "name": "Meeting room",
 *                  "description": "Meeting room",
 *                  "capacity": 200,
 *                  "status": "ACTIVE",
 *                },
 *              ]
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
    LocationController.userGetLocations,
  );

/**
 * @swagger
 * /user-locations/{id}:
 *   get:
 *     summary: Get location
 *     tags:
 *       - User Location
 *     parameters:
 *       - name: id
 *         in: path
 *         description: The location id
 *         type: string
 *     responses:
 *       200:
 *         description: The location
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *           example: {
 *              success: true,
 *              payload: {
 *                "_id": "60421913582070092a398322",
 *                "name": "Meeting room",
 *                "description": "Meeting room",
 *                "capacity": 200,
 *                "status": "ACTIVE",
 *              }
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
  .get(
    isAuthorized(),
    LocationValidator.getLocation,
    LocationController.userGetLocation,
  );

export default router;
