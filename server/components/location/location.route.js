import { Router } from 'express';
import * as LocationValidator from './location.validator';
import * as LocationController from './location.controller';
import { isAuthorized } from '../../api/auth.middleware';

const router = new Router();

/**
 * @swagger
 * /locations:
 *   get:
 *     summary: Get locations
 *     tags:
 *       - Location
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
    LocationController.getLocations,
  );

/**
 * @swagger
 * /locations:
 *   post:
 *     summary: Create location
 *     tags:
 *       - Location
 *     parameters:
 *       - name: body
 *         in: body
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *             parent:
 *               type: string
 *           example: {
 *             "name": "Meeting room",
 *             "description": "Meeting room",
 *             "capacity": 200,
 *             "status": "ACTIVE",
 *           }
 *     responses:
 *       200:
 *         description: The location created
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
 *                 capacity:
 *                   type: number
 *                 status:
 *                   type: string
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
router.route('/')
  .post(
    isAuthorized(),
    LocationValidator.createLocation,
    LocationController.createLocation,
  );

/**
 * @swagger
 * /locations/{id}:
 *   put:
 *     summary: Update location
 *     tags:
 *       - Location
 *     parameters:
 *       - name: id
 *         in: path
 *         description: The location id
 *         type: string
 *       - name: body
 *         in: body
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *             parent:
 *               type: string
 *           example: {
 *             "name": "Meeting room",
 *             "description": "Meeting room",
 *             "capacity": 200,
 *             "status": "ACTIVE",
 *           }
 *     responses:
 *       200:
 *         description: The location updated
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
 *                 parent:
 *                   type: string
 *           example: {
 *              success: true,
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
router.route('/:id')
  .put(
    isAuthorized(),
    LocationValidator.updateLocation,
    LocationController.updateLocation,
  );

/**
 * @swagger
 * /locations/{id}:
 *   delete:
 *     summary: Delete location
 *     tags:
 *       - Location
 *     parameters:
 *       - name: id
 *         in: path
 *         description: The location id
 *         type: string
 *     responses:
 *       200:
 *         description: The location deleted
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
 *       500:
 *         description: When got server exception
 *         schema:
 *           type: string
 *           example: "Internal server error"
 */
router.route('/:id')
  .delete(
    isAuthorized(),
    LocationValidator.deleteLocation,
    LocationController.deleteLocation,
  );

/**
 * @swagger
 * /locations/{id}:
 *   get:
 *     summary: Get location
 *     tags:
 *       - Location
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
    LocationController.getLocation,
  );

export default router;
