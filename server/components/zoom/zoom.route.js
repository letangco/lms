import { Router } from 'express';
import { isAuthorized } from '../../api/auth.middleware';
import * as ZoomController from './zoom.controller';
import * as ZoomValidator from './zoom.validator';

const router = new Router();
router.route('/notifications')
  .post(
    ZoomValidator.verifyAuth,
    ZoomController.notifications,
  );

/**
 * @swagger
 * /zooms:
 *   get:
 *     summary: Get zooms
 *     tags:
 *       - Zoom
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
 *         description: text search client, key
 *         type: string
 *       - name: status
 *         in: query
 *         description: search by status
 *         type: string
 *         enum: [ACTIVE, INACTIVE]
 *       - name: statusLive
 *         in: query
 *         description: search by status live
 *         type: string
 *         enum: [ONLINE, OFFLINE]
 *       - name: order
 *         in: query
 *         description: sort order results
 *         type: string
 *         enum: [zoom_client, zoom_key, zoom_sec, zoom_webhook, status, statusLive]
 *       - name: orderBy
 *         in: query
 *         description: sort order by
 *         type: string
 *         enum: [asc, desc]
 *     responses:
 *       200:
 *         description: The zooms data
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *             payload:
 *               type: array
 *               items:
 *                 $ref: '#/definitions/Zoom'
 *           example: {
 *              success: true,
 *              "payload": {
 *                "data": [
 *                  {
 *                    "_id": "60421913582070092a398322",
 *                    "zoom_client" : "LgDHwiIxR_C3gQFYv8kWwg",
 *                    "zoom_key" : "i5_RPuuXTfm-W0VrSQNf3g",
 *                    "zoom_sec" : "66CDDQ7yFtI1wDWAIv5HeoNUv5rvhwiC26RR",
 *                    "status": "ACTIVE",
 *                  }
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
 *       500:
 *         description: When got server exception
 *         schema:
 *           type: string
 *           example: "Internal server error"
 */
router.route('/')
  .get(
    isAuthorized(),
    ZoomController.getZooms,
  );

/**
 * @swagger
 * /zooms:
 *   post:
 *     summary: Create zoom
 *     tags:
 *       - Zoom
 *     parameters:
 *       - name: body
 *         in: body
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             zoom_client:
 *               type: string
 *             zoom_key:
 *               type: string
 *             zoom_sec:
 *               type: string
 *             status:
 *               type: string
 *           example: {
 *             "zoom_client" : "LgDHwiIxR_C3gQFYv8kWwg",
 *             "zoom_key" : "i5_RPuuXTfm-W0VrSQNf3g",
 *             "zoom_sec" : "66CDDQ7yFtI1wDWAIv5HeoNUv5rvhwiC26RR",
 *             "status": "ACTIVE",
 *           }
 *     responses:
 *       200:
 *         description: The zoom created
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
 *                 zoom_client:
 *                   type: string
 *                 zoom_key:
 *                   type: string
 *                 zoom_sec:
 *                   type: string
 *                 status:
 *                   type: string
 *           example: {
 *              success: true,
 *              payload: {
 *                  "_id": "60421913582070092a398322",
 *                  "zoom_client" : "LgDHwiIxR_C3gQFYv8kWwg",
 *                  "zoom_key" : "i5_RPuuXTfm-W0VrSQNf3g",
 *                  "zoom_sec" : "66CDDQ7yFtI1wDWAIv5HeoNUv5rvhwiC26RR",
 *                  "status": "ACTIVE",
 *                }
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
    ZoomValidator.createZoom,
    ZoomController.createZoom,
  );

/**
 * @swagger
 * /zooms/{id}:
 *   put:
 *     summary: Update zoom
 *     tags:
 *       - Zoom
 *     parameters:
 *       - name: id
 *         in: path
 *         description: The zoom id
 *         type: string
 *       - name: body
 *         in: body
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             zoom_client:
 *               type: string
 *             zoom_key:
 *               type: string
 *             zoom_sec:
 *               type: string
 *             status:
 *               type: string
 *           example: {
 *             "zoom_client" : "LgDHwiIxR_C3gQFYv8kWwg",
 *             "zoom_key" : "i5_RPuuXTfm-W0VrSQNf3g",
 *             "zoom_sec" : "66CDDQ7yFtI1wDWAIv5HeoNUv5rvhwiC26RR",
 *             "status": "ACTIVE",
 *           }
 *     responses:
 *       200:
 *         description: The zoom updated
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
    ZoomValidator.updateZoom,
    ZoomController.updateZoom,
  );

/**
 * @swagger
 * /zooms/{id}:
 *   delete:
 *     summary: Delete zoom
 *     tags:
 *       - Zoom
 *     parameters:
 *       - name: id
 *         in: path
 *         description: The zoom id
 *         type: string
 *     responses:
 *       200:
 *         description: The zoom deleted
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
    ZoomValidator.deleteZoom,
    ZoomController.deleteZoom,
  );

/**
 * @swagger
 * /zooms/{id}:
 *   get:
 *     summary: Get zoom
 *     tags:
 *       - Zoom
 *     parameters:
 *       - name: id
 *         in: path
 *         description: The zoom id
 *         type: string
 *     responses:
 *       200:
 *         description: The zoom
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *           example: {
 *              success: true,
 *              payload: {
 *                  "_id": "60421913582070092a398322",
 *                  "zoom_client" : "LgDHwiIxR_C3gQFYv8kWwg",
 *                  "zoom_key" : "i5_RPuuXTfm-W0VrSQNf3g",
 *                  "zoom_sec" : "66CDDQ7yFtI1wDWAIv5HeoNUv5rvhwiC26RR",
 *                  "status": "ACTIVE",
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
    ZoomValidator.getZoom,
    ZoomController.getZoom,
  );
export default router;
