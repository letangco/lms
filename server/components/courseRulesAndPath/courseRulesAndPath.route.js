import { Router } from 'express';
import * as CourseRulesAndPathValidator from './courseRulesAndPath.validator';
import * as CourseRulesAndPathController from './courseRulesAndPath.controller';
import { isAuthorized } from '../../api/auth.middleware';

const router = new Router();

/**
 * @swagger
 * /course-rules-and-path:
 *   post:
 *     summary: Create course rules and path
 *     tags:
 *       - Course Rules & Path
 *     parameters:
 *       - name: body
 *         in: body
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             course:
 *               type: objectId
 *             showUnits:
 *               type: string
 *             completedWhen:
 *               type: object
 *               properties:
 *                 when:
 *                   type: string
 *                 percent:
 *                   type: number
 *                 units:
 *                   type: array
 *                   items:
 *                     type: objectId
 *                 test:
 *                   type: objectId
 *             calculateScoreByAverageOf:
 *               type: object
 *               properties:
 *                 of:
 *                   type: string
 *                 testsAndAssignments:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       unit:
 *                         type: objectId
 *                       weight:
 *                         type: number
 *             learningPaths:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   paths:
 *                     type: array
 *                     items:
 *                       type: string
 *           example: {
 *             course: '6041e7d5bae1ef03d334d260',
 *             showUnits: 'IN_ANY_ORDER',
 *             completedWhen: {
 *               when: 'A_PERCENTAGE_OF_UNIT_ARE_COMPLETED',
 *               percent: 60,
 *             },
 *             calculateScoreByAverageOf: {
 *               of: 'TESTS_AND_ASSIGNMENTS_CHOOSE',
 *               testsAndAssignments: [
 *                 {
 *                   unit: '6041e7d5bae1ef03d334d261',
 *                   weight: 2,
 *                 }
 *               ],
 *             },
 *             learningPaths: [
 *               {
 *                 paths: [
 *                   '6041e7d5bae1ef03d334d263',
 *                 ],
 *               },
 *             ],
 *           }
 *     responses:
 *       200:
 *         description: The course rules and path created
 *         schema:
 *           type: object
 *           properties:
 *             _id:
 *               type: objectId
 *             course:
 *               type: objectId
 *             showUnits:
 *               type: string
 *             completedWhen:
 *               type: object
 *               properties:
 *                 when:
 *                   type: string
 *                 percent:
 *                   type: number
 *                 units:
 *                   type: array
 *                   items:
 *                     type: objectId
 *                 test:
 *                   type: objectId
 *             calculateScoreByAverageOf:
 *               type: object
 *               properties:
 *                 of:
 *                   type: string
 *                 testsAndAssignments:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       unit:
 *                         type: objectId
 *                       weight:
 *                         type: number
 *             learningPaths:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   paths:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: objectId
 *                         title:
 *                           type: string
 *           example: {
 *              success: true,
 *              payload: {
 *                "completedWhen": {
 *                  "when": "A_PERCENTAGE_OF_UNIT_ARE_COMPLETED",
 *                  "units": [],
 *                  "percent": 66.6
 *                },
 *                "calculateScoreByAverageOf": {
 *                  "of": "TESTS_AND_ASSIGNMENTS_CHOOSE",
 *                  "testsAndAssignments": [
 *                    {
 *                      unit: "606ac39f98603c0480ac6825",
 *                      weight: 2,
 *                    }
 *                  ],
 *                },
 *                "showUnits": "IN_ANY_ORDER",
 *                "learningPaths": [
 *                  {
 *                    paths: [
 *                      {
 *                        _id: "604a0aa584ffcb1d9f67e9a1",
 *                        title: 'Course name'
 *                      }
 *                    ]
 *                  }
 *                ],
 *                "_id": "606aebfa2cf06a06f536a5a1",
 *              }
 *           }
 *       401:
 *         description: Unauthorized
 *         schema:
 *           type: string
 *           example: Unauthorized
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
 *                 "msg": "The course rules and path already existed",
 *                 "param": "courseRulesAndPathExisted",
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
 *                 "msg": "Show units option is invalid",
 *                 "param": "showUnits",
 *               },
 *               {
 *                 "msg": "Course completed option is invalid",
 *                 "param": "completedWhen.when",
 *               },
 *               {
 *                 "msg": "Course completed percent option must be a positive number not larger than 99.9",
 *                 "param": "completedWhen.percent",
 *               },
 *               {
 *                 "msg": "Course completed units option is invalid",
 *                 "param": "completedWhen.units.*",
 *               },
 *               {
 *                 "msg": "Course completed test option is invalid",
 *                 "param": "completedWhen.test",
 *               },
 *               {
 *                 "msg": "Course calculate score option is invalid",
 *                 "param": "calculateScoreByAverageOf.of",
 *               },
 *               {
 *                 "msg": "Course calculate score, tests and assignments items must be an object",
 *                 "param": "calculateScoreByAverageOf.testsAndAssignments.[0]",
 *               },
 *               {
 *                 "msg": "Course calculate score, tests and assignments unit id option is invalid",
 *                 "param": "calculateScoreByAverageOf.testsAndAssignments.[0].unit",
 *               },
 *               {
 *                 "msg": "Course calculate score, tests and assignments weight option must be positive integer",
 *                 "param": "calculateScoreByAverageOf.testsAndAssignments.[0].weight",
 *               },
 *               {
 *                 "msg": "Course learning path items must be an object",
 *                 "param": "learningPaths.[0]",
 *               },
 *               {
 *                 "msg": "Course learning path items property paths must be an array",
 *                 "param": "learningPaths.[0].paths",
 *               },
 *               {
 *                 "msg": "Course learning path, course id is invalid",
 *                 "param": "learningPaths.[0].paths.[0]",
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
    CourseRulesAndPathValidator.createRulesAndPath,
    isAuthorized(),
    CourseRulesAndPathController.createRulesAndPath,
  );

/**
 * @swagger
 * /course-rules-and-path/{id}:
 *   put:
 *     summary: Update course rules and path
 *     tags:
 *       - Course Rules & Path
 *     parameters:
 *       - name: id
 *         in: path
 *         description: The course rules and path id
 *         type: string
 *         required: true
 *       - name: body
 *         in: body
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             showUnits:
 *               type: string
 *             completedWhen:
 *               type: object
 *               properties:
 *                 when:
 *                   type: string
 *                 percent:
 *                   type: number
 *                 units:
 *                   type: array
 *                   items:
 *                     type: objectId
 *                 test:
 *                   type: objectId
 *             calculateScoreByAverageOf:
 *               type: object
 *               properties:
 *                 of:
 *                   type: string
 *                 testsAndAssignments:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       unit:
 *                         type: objectId
 *                       weight:
 *                         type: number
 *             learningPaths:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   paths:
 *                     type: array
 *                     items:
 *                       type: string
 *           example: {
 *             showUnits: 'IN_ANY_ORDER',
 *             completedWhen: {
 *               when: 'A_PERCENTAGE_OF_UNIT_ARE_COMPLETED',
 *               percent: 60,
 *             },
 *             calculateScoreByAverageOf: {
 *               of: 'TESTS_AND_ASSIGNMENTS_CHOOSE',
 *               testsAndAssignments: [
 *                 {
 *                   unit: '6041e7d5bae1ef03d334d261',
 *                   weight: 3,
 *                 }
 *               ],
 *             },
 *             learningPaths: [
 *               {
 *                 paths: [
 *                   '6041e7d5bae1ef03d334d263',
 *                 ],
 *               },
 *             ],
 *           }
 *     responses:
 *       200:
 *         description: The course rules and path updated
 *         schema:
 *           type: object
 *           properties:
 *             _id:
 *               type: objectId
 *             showUnits:
 *               type: string
 *             completedWhen:
 *               type: object
 *               properties:
 *                 when:
 *                   type: string
 *                 percent:
 *                   type: number
 *                 units:
 *                   type: array
 *                   items:
 *                     type: objectId
 *                 test:
 *                   type: objectId
 *             calculateScoreByAverageOf:
 *               type: object
 *               properties:
 *                 of:
 *                   type: string
 *                 testsAndAssignments:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       unit:
 *                         type: objectId
 *                       weight:
 *                         type: number
 *             learningPaths:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   paths:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: objectId
 *                         title:
 *                           type: objectId
 *           example: {
 *              success: true,
 *              payload: {
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
 *                 "msg": "Rules and Path id is invalid",
 *                 "param": "id",
 *               },
 *               {
 *                 "msg": "Show units option is invalid",
 *                 "param": "showUnits",
 *               },
 *               {
 *                 "msg": "Course completed option is invalid",
 *                 "param": "completedWhen.when",
 *               },
 *               {
 *                 "msg": "Course completed percent option must be a positive number not larger than 99.9",
 *                 "param": "completedWhen.percent",
 *               },
 *               {
 *                 "msg": "Course completed units option is invalid",
 *                 "param": "completedWhen.units.*",
 *               },
 *               {
 *                 "msg": "Course completed test option is invalid",
 *                 "param": "completedWhen.test",
 *               },
 *               {
 *                 "msg": "Course calculate score option is invalid",
 *                 "param": "calculateScoreByAverageOf.of",
 *               },
 *               {
 *                 "msg": "Course calculate score, tests and assignments items must be an object",
 *                 "param": "calculateScoreByAverageOf.testsAndAssignments.[0]",
 *               },
 *               {
 *                 "msg": "Course calculate score, tests and assignments unit id option is invalid",
 *                 "param": "calculateScoreByAverageOf.testsAndAssignments.[0].unit",
 *               },
 *               {
 *                 "msg": "Course calculate score, tests and assignments weight option must be positive integer",
 *                 "param": "calculateScoreByAverageOf.testsAndAssignments.[0].weight",
 *               },
 *               {
 *                 "msg": "Course learning path items must be an object",
 *                 "param": "learningPaths.[0]",
 *               },
 *               {
 *                 "msg": "Course learning path items property paths must be an array",
 *                 "param": "learningPaths.[0].paths",
 *               },
 *               {
 *                 "msg": "Course learning path, course id is invalid",
 *                 "param": "learningPaths.[0].paths.[0]",
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
    CourseRulesAndPathValidator.updateRulesAndPath,
    isAuthorized(),
    CourseRulesAndPathController.updateRulesAndPath,
  );

/**
 * @swagger
 * /course-rules-and-path/{id}:
 *   get:
 *     summary: Get course rules and path
 *     tags:
 *       - Course Rules & Path
 *     parameters:
 *       - name: id
 *         in: path
 *         description: The course rules and path id
 *         type: string
 *         required: true
 *     responses:
 *       200:
 *         description: The course rules and path detail
 *         schema:
 *           type: object
 *           properties:
 *             _id:
 *               type: objectId
 *             showUnits:
 *               type: string
 *             completedWhen:
 *               type: object
 *               properties:
 *                 when:
 *                   type: string
 *                 percent:
 *                   type: number
 *                 units:
 *                   type: array
 *                   items:
 *                     type: objectId
 *                 test:
 *                   type: objectId
 *             calculateScoreByAverageOf:
 *               type: object
 *               properties:
 *                 of:
 *                   type: string
 *                 testsAndAssignments:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       unit:
 *                         type: objectId
 *                       weight:
 *                         type: number
 *             learningPaths:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   paths:
 *                     type: array
 *                     items:
 *                       type: string
 *           example: {
 *                "success": true,
 *                "payload": {
 *                  "completedWhen": {
 *                    "when": "A_PERCENTAGE_OF_UNIT_ARE_COMPLETED",
 *                    "units": [],
 *                    "percent": 66.6
 *                  },
 *                  "calculateScoreByAverageOf": {
 *                    "of": "TESTS_AND_ASSIGNMENTS_CHOOSE",
 *                    "testsAndAssignments": [
 *                      {
 *                        unit: {
 *                          "_id": "606ac39f98603c0480ac6825",
 *                          "title": "Test_1617609631343"
 *                        },
 *                        weight: 3,
 *                      }
 *                    ],
 *                  },
 *                  "showUnits": "IN_ANY_ORDER",
 *                  "_id": "606aebfa2cf06a06f536a5a1",
 *                  "learningPaths": [
 *                    {
 *                      "paths": [
 *                        {
 *                          "_id": "60519ad6a0108707d43e6c4e",
 *                          "name": "Exam1"
 *                        }
 *                      ]
 *                    },
 *                    {
 *                      "paths": [
 *                        {
 *                          "_id": "60519c6be96ae407e378bf88",
 *                          "name": "Exam2"
 *                        },
 *                        {
 *                          "_id": "60519cb4b8a82807f002c246",
 *                          "name": "Exam3"
 *                        }
 *                      ]
 *                    }
 *                  ]
 *                }
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
 *                 "msg": "Rules and Path id is invalid",
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
    CourseRulesAndPathValidator.getRulesAndPath,
    isAuthorized(),
    CourseRulesAndPathController.getRulesAndPath,
  );

export default router;
