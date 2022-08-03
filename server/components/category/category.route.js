import { Router } from 'express';
import * as CategoryValidator from './category.validator';
import * as CategoryController from './category.controller';
import { isAuthorized } from '../../api/auth.middleware';

const router = new Router();

/**
 * @swagger
 * /categories:
 *   get:
 *     summary: Get categories
 *     tags:
 *       - Category
 *     responses:
 *       200:
 *         description: The categories data
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *             payload:
 *               type: array
 *               items:
 *                 $ref: '#/definitions/Category'
 *           example: {
 *              success: true,
 *              payload: [
 *                {
 *                  "_id": "60421913582070092a398322",
 *                  "name": "High school",
 *                  "parent": "60421913582070092a398321",
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
    CategoryController.getCategories,
  );

/**
 * @swagger
 * /categories:
 *   post:
 *     summary: Create category
 *     tags:
 *       - Category
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
 *             "name": "High school",
 *             "parent": "60421913582070092a398321",
 *           }
 *     responses:
 *       200:
 *         description: The category created
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
 *              payload: {
 *                "_id": "60421913582070092a398322",
 *                "name": "High school",
 *                "parent": "60421913582070092a398321",
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
    CategoryValidator.createCategory,
    CategoryController.createCategory,
  );

/**
 * @swagger
 * /categories/{id}:
 *   put:
 *     summary: Update category
 *     tags:
 *       - Category
 *     parameters:
 *       - name: id
 *         in: path
 *         description: The category id
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
 *             "name": "High school",
 *             "parent": "60421913582070092a398321",
 *           }
 *     responses:
 *       200:
 *         description: The category updated
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
 *              payload: {
 *                "_id": "60421913582070092a398322",
 *                "name": "High school",
 *                "parent": "60421913582070092a398321",
 *              }
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
    CategoryValidator.updateCategory,
    CategoryController.updateCategory,
  );

/**
 * @swagger
 * /categories/{id}:
 *   delete:
 *     summary: Delete category
 *     tags:
 *       - Category
 *     parameters:
 *       - name: id
 *         in: path
 *         description: The category id
 *         type: string
 *     responses:
 *       200:
 *         description: The category deleted
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
    CategoryValidator.deleteCategory,
    CategoryController.deleteCategory,
  );

export default router;
