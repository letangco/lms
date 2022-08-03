import { Router } from 'express';
import * as UserController from './user.controller';
import * as UserValidator from './user.validator';
import * as UserMulter from './user.multer';
import { isAuthorized } from '../../api/auth.middleware';
import { multerBodyParser } from '../../api/multerBodyParser.middleware';
// import * as ChatGroupValidator from '../chatGroup/chatGroup.validator';
// import * as ChatGroupController from '../chatGroup/chatGroup.controller';

const router = new Router();
//
// router.route('/migrate-data-course')
//     .post(
//         UserController.migrateData,
//     );
// router.route('/migrate-data-user-course')
//     .post(
//         UserController.migrateDataUserCourse,
//     );
// router.route('/migrate-data-user-event')
//     .post(
//         UserController.migrateDataUserEvent,
//     );
// router.route('/migrate-data-user-event-tracking')
//     .post(
//         UserController.migrateDataUserEventTracking,
//     );
router.route('/migrate-data-chat')
    .post(
        UserController.migrateDataChat,
    );
/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: Login to your account
 *     tags:
 *       - User
 *     parameters:
 *       - name: body
 *         in: body
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             email:
 *               type: string
 *             password:
 *               type: string
 *           example: {
 *             "email": "example@email.com",
 *             "password": "superStrOngPassword"
 *           }
 *     responses:
 *       200:
 *         name: body
 *         in: body
 *         required: true
 *         description: Your account info
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *             payload:
 *               $ref: '#/definitions/User'
 *           example: {
 *              success: true,
 *              payload: {
 *               "roles": [
 *                 "SUPER_ADMIN",
 *                 "ADMIN",
 *                 "INSTRUCTOR",
 *                 "LEARNER"
 *               ],
 *               "status": "ACTIVE",
 *               "_id": "6041e7d5bae1ef03d334d261",
 *               "firstName": "Exam",
 *               "lastName": "ple",
 *               "email": "example@mail.com",
 *               "fullName": "Exam ple",
 *               "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2MDUyZWY2NTQxYmNlMThlMjhkZDZhZmYiLCJyb2xlcyI6WyJTVVBFUl9BRE1JTiIsIkFETUlOIiwiSU5TVFJVQ1RPUiIsIkxFQVJORVIiXSwiaWF0IjoxNjE2MDQ4ODM2LCJleHAiOjE2MTY5MTI4MzZ9.VmLLkpvyt3hcohJspnX4HM3ixiKJP0_oV1o5-V2oNIU"
 *             }
 *           }
 *       403:
 *         description: When data cannot be process.
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
 *                 "msg": "The email address that you've entered doesn't match any account.",
 *                 "param": "emailNotRegistered",
 *               },
 *               {
 *                 "msg": "Email or password is not correct",
 *                 "param": "emailPassword",
 *               },
 *               {
 *                 "msg": "Your account was deactivated",
 *                 "param": "accountDeactivated",
 *               },
 *               {
 *                 "msg": "Your account was deleted",
 *                 "param": "accountDeleted",
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
 *                 "value": "mail mail",
 *                 "msg": "must be an email",
 *                 "param": "email",
 *                 "location": "body"
 *               }
 *             ]
 *           }
 *       500:
 *         description: When got server exception
 *         schema:
 *           type: string
 *           example: "Internal server error"
 */
router.route('/login')
  .post(
    UserValidator.userLoginValidator,
    UserController.login,
  );

router.route('/tracking-login-times')
  .get(
    UserValidator.userTrackingLoginValidator,
    isAuthorized(),
    UserController.trackingLoginTimes,
  );

router.route('/admin-login-user/:id')
  .post(
    isAuthorized(),
    UserController.adminLoginUser,
  );

/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Get user information
 *     tags:
 *       - User
 *     responses:
 *       200:
 *         description: The user information
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *             payload:
 *               $ref: '#/definitions/User'
 *           example: {
 *             success: true,
 *             payload: {
 *               "roles": [
 *                 "SUPER_ADMIN",
 *                 "ADMIN",
 *                 "INSTRUCTOR",
 *                 "LEARNER"
 *               ],
 *               "status": "ACTIVE",
 *               "_id": "6051ddd72c6bba0313baa34f",
 *               "firstName": "I am",
 *               "lastName": "Instructor",
 *               "email": "instructor@mail.com",
 *               "username": "instructor",
 *               "type": "6049e9228e62941b2dc3a578",
 *               "timezone": {
 *                 "name": "(GMT +07:00) Asia/Ho_Chi_Minh",
 *                 "value": "Asia/Ho_Chi_Minh",
 *               },
 *               "language": {
 *                 "_id": "60421f520ec4e2099c8393e9",
 *                 "name": "Tiếng Việt",
 *                 "value": "vi",
 *               },
 *               "createdAt": "2021-03-17T10:45:43.629Z",
 *               "fullName": "I am Instructor",
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
router.route('/me')
  .get(
    isAuthorized(),
    UserController.getUser,
  );

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create user
 *     tags:
 *       - User
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: formData
 *         name: user-avatar
 *         type: file
 *         description: The user avatar
 *       - in: formData
 *         name: data
 *         type: object
 *         description: The body stringify information
 *         schema:
 *           type: object
 *           properties:
 *             firstName:
 *               type: string
 *             lastName:
 *               type: string
 *             email:
 *               type: string
 *             username:
 *               type: string
 *             password:
 *               type: string
 *             bio:
 *               type: string
 *             roles:
 *               type: array
 *               items:
 *                 type: string
 *             timezone:
 *               type: string
 *             language:
 *               type: string
 *             status:
 *               type: string
 *           example: {
 *             "firstName": "Exam",
 *             "lastName": "ple",
 *             "username": "example",
 *             "email": "example@mail.com",
 *             "password": "newpassword",
 *             "bio": "Hello",
 *             "roles": ["ADMIN", "INSTRUCTOR", "LEARNER"],
 *             "timezone": "Asia/Ho_Chi_Minh",
 *             "language": "6041e7d5bae1ef03dcc4d2e2",
 *             "status": "ACTIVE",
 *           }
 *     responses:
 *       200:
 *         description: The user profile
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *             payload:
 *               type: object
 *               properties:
 *                 $ref: '#/definitions/User'
 *           example: {
 *             success: true,
 *             payload: {
 *               _id: "5f092acdfd2938050e3d5ed5",
 *               firstName: "Exam",
 *               lastName: "ple",
 *               username: "example",
 *               bio: "Hello",
 *               avatar: "http://localhost:3101/uploads/user-avatar/5bea5655d05143d8a576a5d9/avatar.png",
 *               email: "user@mail.com",
 *               timezone: "Asia/Ho_Chi_Minh",
 *               language: "6041e7d5bae1ef03dcc4d2e2",
 *               roles: ["ADMIN", "INSTRUCTOR", "LEARNER"],
 *             }
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
 *                 msg: 'The email address is already using by someone',
 *                 param: 'emailAlreadyUsed',
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
 *                 msg: 'User email is invalid',
 *                 param: 'email',
 *                 location: 'body',
 *                 value: 'mail@mail',
 *               },
 *               {
 *                 msg: 'User email cannot exceed 150 characters',
 *                 param: 'email',
 *                 location: 'body',
 *                 value: 'verylongemail_largerthan150characters@mail',
 *               },
 *               {
 *                 msg: 'Username is invalid',
 *                 param: 'email',
 *                 location: 'body',
 *                 value: 'user name cannot have space',
 *               },
 *               {
 *                 msg: 'Username cannot exceed 150 characters',
 *                 param: 'email',
 *                 location: 'body',
 *                 value: 'very_long_username',
 *               },
 *               {
 *                 msg: 'User first name cannot exceed 50 characters',
 *                 param: 'firstName',
 *                 location: 'body',
 *                 value: 'very long first name',
 *               },
 *               {
 *                 msg: 'User last name cannot exceed 50 characters',
 *                 param: 'lastName',
 *                 location: 'body',
 *                 value: 'very long last name',
 *               },
 *               {
 *                 msg: 'User bio cannot exceed 1000 characters',
 *                 param: 'bio',
 *                 location: 'body',
 *                 value: 'very long bio',
 *               },
 *               {
 *                 msg: 'Password must be at least 4 characters',
 *                 param: 'password',
 *                 location: 'body',
 *                 value: 'a',
 *               },
 *               {
 *                 msg: 'User timezone is invalid',
 *                 param: 'timezone',
 *                 location: 'body',
 *                 value: 'a',
 *               },
 *               {
 *                 msg: 'User language is invalid',
 *                 param: 'language',
 *                 location: 'body',
 *                 value: 'a',
 *               },
 *               {
 *                 msg: 'User type is invalid',
 *                 param: 'type',
 *                 location: 'body',
 *                 value: 'a',
 *               },
 *               {
 *                 msg: 'User avatar file is invalid, only image files are allowed, max size: 2MB',
 *                 param: 'userAvatarInvalid',
 *                 location: 'body',
 *               },
 *               {
 *                 msg: 'Username is already using by someone',
 *                 param: 'usernameAlreadyUsed',
 *                 location: 'body',
 *               },
 *               {
 *                 msg: 'Email is already using by someone',
 *                 param: 'emailAlreadyUsed',
 *                 location: 'body',
 *               },
 *               {
 *                 msg: 'User status is invalid',
 *                 param: 'status',
 *                 location: 'body',
 *               },
 *             ]
 *           }
 *       500:
 *         description: When got server exception
 */
/**
 * @swagger
 * /users:
 *   put:
 *     summary: Update user profile
 *     tags:
 *       - User
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: formData
 *         name: user-avatar
 *         type: file
 *         description: The user avatar
 *       - in: formData
 *         name: data
 *         type: object
 *         description: The body stringify information
 *         schema:
 *           type: object
 *           properties:
 *             firstName:
 *               type: string
 *             lastName:
 *               type: string
 *             email:
 *               type: string
 *             username:
 *               type: string
 *             password:
 *               type: string
 *             bio:
 *               type: string
 *             timezone:
 *               type: string
 *             language:
 *               type: string
 *             status:
 *               type: string
 *           example: {
 *             "firstName": "Exam",
 *             "lastName": "ple",
 *             "username": "example",
 *             "email": "example@mail.com",
 *             "password": "newpassword",
 *             "bio": "Hello",
 *             "type": "6041e7d5bae1ef03dcc4d261",
 *             "timezone": "Asia/Ho_Chi_Minh",
 *             "language": "6041e7d5bae1ef03dcc4d2e2",
 *             "status": "ACTIVE",
 *           }
 *     responses:
 *       200:
 *         description: The user profile updated
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *             payload:
 *               type: object
 *               properties:
 *                 $ref: '#/definitions/User'
 *           example: {
 *             success: true,
 *             payload: {
 *               _id: "5f092acdfd2938050e3d5ed5",
 *               firstName: "Exam",
 *               lastName: "ple",
 *               username: "example",
 *               bio: "Hello",
 *               avatar: "http://localhost:3101/uploads/user-avatar/5bea5655d05143d8a576a5d9/avatar.png",
 *               email: "user@mail.com",
 *               timezone: "Asia/Ho_Chi_Minh",
 *               language: "6041e7d5bae1ef03dcc4d2e2",
 *               type: {
 *                 _id: "6041e7d5bae1ef03dcc4d2a3",
 *                 roles: ["ADMIN", "INSTRUCTOR", "LEARNER"],
 *               },
 *             }
 *           }
 *       304:
 *         description: Not Modified
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
 *                 msg: 'The email address is already using by someone',
 *                 param: 'emailAlreadyUsed',
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
 *                 msg: 'User email is invalid',
 *                 param: 'email',
 *                 location: 'body',
 *                 value: 'mail@mail',
 *               },
 *               {
 *                 msg: 'User email cannot exceed 150 characters',
 *                 param: 'email',
 *                 location: 'body',
 *                 value: 'verylongemail_largerthan150characters@mail',
 *               },
 *               {
 *                 msg: 'Username is invalid',
 *                 param: 'email',
 *                 location: 'body',
 *                 value: 'user name cannot have space',
 *               },
 *               {
 *                 msg: 'Username cannot exceed 150 characters',
 *                 param: 'email',
 *                 location: 'body',
 *                 value: 'very_long_username',
 *               },
 *               {
 *                 msg: 'User first name cannot exceed 50 characters',
 *                 param: 'firstName',
 *                 location: 'body',
 *                 value: 'very long first name',
 *               },
 *               {
 *                 msg: 'User last name cannot exceed 50 characters',
 *                 param: 'lastName',
 *                 location: 'body',
 *                 value: 'very long last name',
 *               },
 *               {
 *                 msg: 'User bio cannot exceed 1000 characters',
 *                 param: 'bio',
 *                 location: 'body',
 *                 value: 'very long bio',
 *               },
 *               {
 *                 msg: 'Password must be at least 4 characters',
 *                 param: 'password',
 *                 location: 'body',
 *                 value: 'a',
 *               },
 *               {
 *                 msg: 'User timezone is invalid',
 *                 param: 'timezone',
 *                 location: 'body',
 *                 value: 'a',
 *               },
 *               {
 *                 msg: 'User language is invalid',
 *                 param: 'language',
 *                 location: 'body',
 *                 value: 'a',
 *               },
 *               {
 *                 msg: 'User type is invalid',
 *                 param: 'type',
 *                 location: 'body',
 *                 value: 'a',
 *               },
 *               {
 *                 msg: 'User avatar file is invalid, only image files are allowed, max size: 2MB',
 *                 param: 'userAvatarInvalid',
 *                 location: 'body',
 *               },
 *               {
 *                 msg: 'Username is already using by someone',
 *                 param: 'usernameAlreadyUsed',
 *                 location: 'body',
 *               },
 *               {
 *                 msg: 'Email is already using by someone',
 *                 param: 'emailAlreadyUsed',
 *                 location: 'body',
 *               },
 *               {
 *                 msg: 'User status is invalid',
 *                 param: 'status',
 *                 location: 'body',
 *               },
 *             ]
 *           }
 *       500:
 *         description: When got server exception
 */
router.route('/')
  .post(
    isAuthorized(),
    UserMulter.userProfileUploader,
    multerBodyParser,
    UserValidator.createUser,
    UserController.createUser,
  )
  .put(
    isAuthorized(),
    UserMulter.userProfileUploader,
    multerBodyParser,
    UserValidator.updateUserProfile,
    UserController.updateUserProfile,
  );

/**
 * @swagger
 * /users/search:
 *   get:
 *     summary: Search users. Do not provide both firstId and lastId on same request.
 *     tags:
 *       - User
 *     parameters:
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

router.route('/search')
.get(
  UserValidator.searchUsers,
  isAuthorized(),
  UserController.searchUsers,
);

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get users
 *     tags:
 *       - User
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
 *         description: Search user by name
 *         type: string
 *     responses:
 *       200:
 *         description: The users
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
 *                       $ref: '#/definitions/User'
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
    UserValidator.getUsers,
    isAuthorized(),
    UserController.getUsers,
  );

/**
 * @swagger
 * /users/forgot-password:
 *   post:
 *     summary: Reset user password
 *     tags:
 *       - User
 *     parameters:
 *       - name: body
 *         in: body
 *         required: true
 *         properties:
 *           email:
 *             type: string
 *         example: {
 *           "email": "example@email.com",
 *         }
 *     responses:
 *       200:
 *         description: Send the forgot password email success
 *         schema:
 *           type: object
 *           example: {
 *             success: true,
 *             payload: "If your email is correctly, we have sent you a forgot password email, please check your inbox",
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
 *                 $ref: '#/definitions/ValidatorErrorItem'
 *           example: {
 *             success: false,
 *             errors: [
 *               {
 *                 "msg": "Your account is not available, had been deleted or deactivated",
 *                 param: 'accountNotAvailable',
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
 *                 $ref: '#/definitions/ValidatorErrorItem'
 *           example: {
 *             success: false,
 *             errors: [
 *               {
 *                 "value": "mail",
 *                 "msg": "Email is not valid",
 *                 "param": "email",
 *                 "location": "body",
 *               },
 *             ]
 *           }
 *       500:
 *         description: When got server exception
 *         schema:
 *           type: string
 *           example: "Internal server error"
 */
router.route('/forgot-password')
  .post(
    UserValidator.forgotPassword,
    UserController.forgotPassword,
  );

/**
 * @swagger
 * /users/forgot-password/verify:
 *   post:
 *     summary: Verify user forgot password
 *     tags:
 *       - User
 *     parameters:
 *       - name: body
 *         in: body
 *         required: true
 *         properties:
 *           newPassword:
 *             type: string
 *         example: {
 *           "newPassword": "superStOngPassword2",
 *         }
 *     responses:
 *       200:
 *         description: Password update success, please login to your account with new password
 *         schema:
 *           type: object
 *           example: {
 *             success: true,
 *             payload: "Password update success, please login with new password",
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
 *                 $ref: '#/definitions/ValidatorErrorItem'
 *           example: {
 *             success: false,
 *             errors: [
 *               {
 *                 "value": "pass",
 *                 "msg": "New password must be at least 8 chars long",
 *                 "param": "newPassword",
 *                 "location": "body",
 *               },
 *             ]
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
 *                 $ref: '#/definitions/ValidatorErrorItem'
 *           example: {
 *             success: false,
 *             errors: [
 *               {
 *                 "msg": "You have no forgot password request",
 *                 param: 'noForgotPassword',
 *               },
 *               {
 *                 "msg": "Your verification code is expired, please request new one",
 *                 param: 'tokenExpired',
 *               },
 *             ]
 *           }
 *       500:
 *         description: When got server exception
 *         schema:
 *           type: string
 *           example: "Internal server error"
 */
router.route('/forgot-password/verify')
  .post(
    UserValidator.verifyForgotPassword,
    isAuthorized(),
    UserController.verifyForgotPassword,
  );

router.route('/import-user')
  .post(
    UserValidator.verifyImportUser,
    isAuthorized(),
    UserController.importUser,
  );

router.route('/check-import-user')
  .post(
    UserValidator.verifyImportUser,
    isAuthorized(),
    UserController.checkImportUser,
  );

router.route('/check-import')
  .post(
    UserValidator.verifyImport,
    isAuthorized(),
    UserController.checkImport,
  );

router.route('/import')
  .post(
    UserValidator.verifyImport,
    isAuthorized(),
    UserController.importData,
  );
router.route('/export')
  .get(
    isAuthorized(),
    UserController.exportData,
  );

router.route('/get-user-config')
  .get(
    isAuthorized(),
    UserController.getUserConfig
  );
router.route('/add-user-config')
  .post(
    isAuthorized(),
    UserController.addUserConfig,
  );

/**
 * @swagger
 * /users/reset-unread-message:
 *   put:
 *     summary: Reset number unread message of user
 *     tags:
 *       - User
 *     responses:
 *       200:
 *         description: Reset number unread message of user success
 *         schema:
 *           type: object
 *           example: {
 *             success: true,
 *           }
 *       500:
 *         description: When got server exception
 *         schema:
 *           type: string
 *           example: "Internal server error"
 */

router.route('/reset-unread-message')
  .put(
    isAuthorized(),
    UserController.resetUserUnreadMessage,
  );

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get user information
 *     tags:
 *       - User
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: The user information
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *             payload:
 *               $ref: '#/definitions/User'
 *           example: {
 *             success: true,
 *             payload: {
 *               "roles": [
 *                 "SUPER_ADMIN",
 *                 "ADMIN",
 *                 "INSTRUCTOR",
 *                 "LEARNER"
 *               ],
 *               "status": "ACTIVE",
 *               "_id": "6051ddd72c6bba0313baa34f",
 *               "firstName": "I am",
 *               "lastName": "Instructor",
 *               "email": "instructor@mail.com",
 *               "username": "instructor",
 *               "type": {
 *                 _id: "6049e9228e62941b2dc3a578",
 *                 roles: ['ADMIN', 'INSTRUCTOR']
 *               },
 *               "timezone": {
 *                 "name": "(GMT +07:00) Asia/Ho_Chi_Minh",
 *                 "value": "Asia/Ho_Chi_Minh",
 *               },
 *               "language": {
 *                 "_id": "60421f520ec4e2099c8393e9",
 *                 "name": "Tiếng Việt",
 *                 "value": "vi",
 *               },
 *               "createdAt": "2021-03-17T10:45:43.629Z",
 *               "fullName": "I am Instructor",
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
 * /users:
 *   put:
 *     summary: Update user profile
 *     tags:
 *       - User
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *       - in: formData
 *         name: user-avatar
 *         type: file
 *         description: The user avatar
 *       - in: formData
 *         name: data
 *         type: object
 *         description: The body stringify information
 *         schema:
 *           type: object
 *           properties:
 *             firstName:
 *               type: string
 *             lastName:
 *               type: string
 *             email:
 *               type: string
 *             username:
 *               type: string
 *             password:
 *               type: string
 *             bio:
 *               type: string
 *             timezone:
 *               type: string
 *             language:
 *               type: string
 *             type:
 *               type: string
 *             status:
 *               type: string
 *           example: {
 *             "firstName": "Exam",
 *             "lastName": "ple",
 *             "username": "example",
 *             "email": "example@mail.com",
 *             "password": "newpassword",
 *             "bio": "Hello",
 *             "type": "6041e7d5bae1ef03dcc4d261",
 *             "timezone": "Asia/Ho_Chi_Minh",
 *             "language": "6041e7d5bae1ef03dcc4d2e2",
 *             "status": "ACTIVE",
 *           }
 *     responses:
 *       200:
 *         description: The user profile updated
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *             payload:
 *               type: object
 *               properties:
 *                 $ref: '#/definitions/User'
 *           example: {
 *             success: true,
 *             payload: {
 *               _id: "5f092acdfd2938050e3d5ed5",
 *               firstName: "Exam",
 *               lastName: "ple",
 *               username: "example",
 *               bio: "Hello",
 *               avatar: "http://localhost:3101/uploads/user-avatar/5bea5655d05143d8a576a5d9/avatar.png",
 *               email: "user@mail.com",
 *               timezone: "Asia/Ho_Chi_Minh",
 *               language: "6041e7d5bae1ef03dcc4d2e2",
 *               type: {
 *                 _id: "6041e7d5bae1ef03dcc4d2a3",
 *                 roles: ['ADMIN', 'INSTRUCTOR', 'LEARNER']
 *               }
 *             }
 *           }
 *       304:
 *         description: Not Modified
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
 *                 msg: 'The email address is already using by someone',
 *                 param: 'emailAlreadyUsed',
 *               },
 *               {
 *                 msg: 'You can not update your user type',
 *                 param: 'youCannotUpdateYourUserType',
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
 *                 "value": "aaa",
 *                 "msg": "User id is invalid",
 *                 "param": "id",
 *                 "location": "param"
 *               },
 *               {
 *                 msg: 'User email is invalid',
 *                 param: 'email',
 *                 location: 'body',
 *                 value: 'mail@mail',
 *               },
 *               {
 *                 msg: 'User email cannot exceed 150 characters',
 *                 param: 'email',
 *                 location: 'body',
 *                 value: 'verylongemail_largerthan150characters@mail',
 *               },
 *               {
 *                 msg: 'Username is invalid',
 *                 param: 'email',
 *                 location: 'body',
 *                 value: 'user name cannot have space',
 *               },
 *               {
 *                 msg: 'Username cannot exceed 150 characters',
 *                 param: 'email',
 *                 location: 'body',
 *                 value: 'very_long_username',
 *               },
 *               {
 *                 msg: 'User first name cannot exceed 50 characters',
 *                 param: 'firstName',
 *                 location: 'body',
 *                 value: 'very long first name',
 *               },
 *               {
 *                 msg: 'User last name cannot exceed 50 characters',
 *                 param: 'lastName',
 *                 location: 'body',
 *                 value: 'very long last name',
 *               },
 *               {
 *                 msg: 'User bio cannot exceed 1000 characters',
 *                 param: 'bio',
 *                 location: 'body',
 *                 value: 'very long bio',
 *               },
 *               {
 *                 msg: 'Password must be at least 4 characters',
 *                 param: 'password',
 *                 location: 'body',
 *                 value: 'a',
 *               },
 *               {
 *                 msg: 'User timezone is invalid',
 *                 param: 'timezone',
 *                 location: 'body',
 *                 value: 'a',
 *               },
 *               {
 *                 msg: 'User language is invalid',
 *                 param: 'language',
 *                 location: 'body',
 *                 value: 'a',
 *               },
 *               {
 *                 msg: 'User type is invalid',
 *                 param: 'type',
 *                 location: 'body',
 *                 value: 'a',
 *               },
 *               {
 *                 msg: 'User avatar file is invalid, only image files are allowed, max size: 2MB',
 *                 param: 'userAvatarInvalid',
 *                 location: 'body',
 *               },
 *               {
 *                 msg: 'Username is already using by someone',
 *                 param: 'usernameAlreadyUsed',
 *                 location: 'body',
 *               },
 *               {
 *                 msg: 'Email is already using by someone',
 *                 param: 'emailAlreadyUsed',
 *                 location: 'body',
 *               },
 *               {
 *                 msg: 'User status is invalid',
 *                 param: 'status',
 *                 location: 'body',
 *               },
 *             ]
 *           }
 *       500:
 *         description: When got server exception
 */
router.route('/:id')
  .get(
    UserValidator.getUserInfo,
    isAuthorized(),
    UserController.getUserInfo,
  )
  .put(
    isAuthorized(),
    UserMulter.userProfileUploader,
    multerBodyParser,
    UserValidator.adminUpdateUserProfile,
    UserController.adminUpdateUserProfile,
  );

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Delete user account
 *     tags:
 *       - User
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User account deleted
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
router.route('/:id')
  .delete(
    UserValidator.deleteUserValidator,
    isAuthorized(),
    UserController.deleteUser,
  );

/**
 * @swagger
 * /users/{id}/permanently:
 *   delete:
 *     summary: Permanently delete user account
 *     tags:
 *       - User
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User account permanently deleted
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
router.route('/:id/permanently')
  .delete(
    UserValidator.permanentlyDeleteUserValidator,
    isAuthorized(),
    UserController.permanentlyDeleteUser,
  );
// router.route('/setup-zoom')
//   .post(
//     isAuthorized(),
//     UserController.addZoom,
//   )
//   .put(
//     isAuthorized(),
//     UserController.updateZoom,
//   )
//   .get(
//   isAuthorized(),
//   UserController.getZoom,
//   )
//   .delete(
//   isAuthorized(),
//   UserController.deleteZoom,
// );
// router.route('/get-zooms-setup')
//   .get(
//     isAuthorized(),
//     UserController.getZooms,
//   );

export default router;
