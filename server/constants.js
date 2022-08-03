import path from 'path';

/**
 * The global constants
 */
export const MEGABYTE = 1024 * 1024;
export const MAX_USER_AVATAR_UPLOAD_FILE_SIZE_MB = 2;
export const MAX_COURSE_THUMBNAIL_UPLOAD_FILE_SIZE_MB = 4;
export const MAX_UPLOAD_FILE_SYSTEM_SIZE_MB = 4;
export const MAX_COURSE_VIDEO_INTRO_UPLOAD_FILE_SIZE_MB = 100;
export const MAX_CHAT_MESSAGE_UPLOAD_FILE_SIZE_MB = 25;
export const MAX_UPLOAD_FILE_SIZE_MB = 100;
export const ROOT_PATH = path.resolve(__dirname, '../');
export const UPLOADS_DESTINATION = 'uploads';
export const MORGAN_FORMAT = ':remote-addr - :remote-user [:date[iso]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" - :response-time ms';
export const DEFAULT_LANGUAGE = 'en';
export const DEFAULT_PAGE_LIMIT = 20;
export const MAX_PAGE_LIMIT = 200;
export const RESEND_EMAIL_AFTER_FAILED = 120000; // 2 minutes
export const RESTART_ROOM_HOOK_AFTER = 300000; // 5 minutes
export const WORKER_NAME = {
  SEND_MAIL: 'SEND_MAIL',
  CONVERT_MEDIA: 'CONVERT_MEDIA',
  ROOM_HOOK: 'ROOM_HOOK',
  ROOM_RECORDED_HOOK: 'ROOM_RECORDED_HOOK',
};
export const REDIS_KEYS = {
  MAIL_TEMPLATE: 'MAIL_TEMPLATE',
  TIMEZONE: 'TIMEZONE',
  LANGUAGE: 'LANGUAGE',
  TEACHING_LANGUAGE: 'TEACHING_LANGUAGE',
  UNIT_USER_TYPE: 'UNIT_USER_TYPE',
  USER_TYPE: 'USER_TYPE',
  CATEGORY: 'CATEGORY',
  ROOM_HOOK: 'ROOM_HOOK',
  ROOM_TRACKING_INFO: 'ROOM_TRACKING_INFO',
  ZOOM_ACCOUNT: 'ZOOM_ACCOUNT',
  TRACKING_GROUP_JOINED: 'TRACKING_GROUP_JOINED',
  SNAPSHOT: 'SNAPSHOT'
};
export const REDIS_TIME = 60;
export const REDIS_TIME_USER_LOGIN = 8*60*60;
// Socket
export const SOCKET_CHAT_EVENT = {
  MESSAGE: 'MESSAGE',
  USER_ONLINE_STATE_CHANGE: 'USER_ONLINE_STATE_CHANGE',
  USER_UNREAD_MESSAGE_NUM: 'USER_UNREAD_MESSAGE_NUM',
  GROUP_UNREAD_MESSAGE_NUM: 'GROUP_UNREAD_MESSAGE_NUM',
  GROUP_CHAT_UPDATE: 'GROUP_CHAT_UPDATE',
};
export const EVENT_LOGS_TYPE = {
  LOGIN: 'LOGIN',
  REGISTER: 'REGISTER',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  UNDELETE: 'UNDELETE',
  CREATE: 'CREATE',
  ADD: 'ADD',
  REMOVE: 'REMOVE',
  PASSED: 'PASSED',
  NOTPASSED: 'NOTPASSED',
  COMPLETED: 'COMPLETED',
  GRADED: 'GRADED',
  DOWNLOAD: 'DOWNLOAD',
  RESUBMIT: 'RESUBMIT',
  STARTED: 'STARTED',
  ENDED: 'ENDED',
  IMPORT: 'IMPORT',
  EXPORT: 'EXPORT'
};
export const EVENT_LOGS = {
  USER_LOGIN: 'USER_LOGIN',
  USER_REGISTER: 'USER_REGISTER',
  USER_DELETION: 'USER_DELETION',
  UNDELETE_USER: 'UNDELETE_USER',
  USER_UPDATE: 'USER_UPDATE',
  COURSE_CREATION: 'COURSE_CREATION',
  COURSE_DELETION: 'COURSE_DELETION',
  UNDELETE_COURSE: 'UNDELETE_COURSE',
  COURSE_UPDATE: 'COURSE_UPDATE',
  INTAKE_CREATION: 'INTAKE_CREATION',
  INTAKE_DELETION: 'INTAKE_DELETION',
  UNDELETE_INTAKE: 'UNDELETE_INTAKE',
  INTAKE_UPDATE: 'INTAKE_UPDATE',
  UNIT_CREATION: 'UNIT_CREATION',
  UNIT_DELETION: 'UNIT_DELETION',
  UNDELETE_UNIT: 'UNDELETE_UNIT',
  UNIT_UPDATE: 'UNIT_UPDATE',
  GROUP_USER_CREATION: 'GROUP_USER_CREATION',
  GROUP_USER_DELETION: 'GROUP_USER_DELETION',
  GROUP_USER_UNDELETE: 'GROUP_USER_UNDELETE',
  GROUP_USER_UPDATE: 'GROUP_USER_UPDATE',
  ADD_USER_TO_GROUP: 'ADD_USER_TO_GROUP',
  REMOVE_USER_FROM_GROUP: 'REMOVE_USER_FROM_GROUP',
  EVENT_CREATION: 'EVENT_CREATION',
  EVENT_DELETION: 'EVENT_DELETION',
  EVENT_UNDELETE: 'EVENT_UNDELETE',
  EVENT_UPDATE: 'EVENT_UPDATE',
  DISCUSSION_CREATION: 'DISCUSSION_CREATION',
  DISCUSSION_DELETION: 'DISCUSSION_DELETION',
  DISCUSSION_UNDELETE: 'DISCUSSION_UNDELETE',
  DISCUSSION_UPDATE: 'DISCUSSION_UPDATE',
  ADD_USER_TO_EVENT: 'ADD_USER_TO_EVENT',
  REMOVE_USER_FROM_EVENT: 'REMOVE_USER_FROM_EVENT',
  STARTED_EVENT: 'STARTED_EVENT',
  ENDED_EVENT: 'ENDED_EVENT',
  ADD_USER_TO_INTAKE: 'ADD_USER_TO_INTAKE',
  REMOVE_USER_FROM_INTAKE: 'REMOVE_USER_FROM_INTAKE',
  USER_COMPLETED_INTAKE: 'USER_COMPLETED_INTAKE',
  USER_NOT_PASS_INTAKE: 'USER_NOT_PASS_INTAKE',
  USER_TEST_COMPLETED: 'USER_TEST_COMPLETED',
  USER_TEST_FAILED: 'USER_TEST_FAILED',
  USER_TEST_RESET: 'USER_TEST_RESET',
  USER_SURVEY_COMPLETED: 'USER_SURVEY_COMPLETED',
  USER_ASSIGNMENT_SUBMISSION: 'USER_ASSIGNMENT_SUBMISSION',
  USER_ASSIGNMENT_GRADED: 'USER_ASSIGNMENT_GRADED',
  USER_ASSIGNMENT_RESET: 'USER_ASSIGNMENT_RESET',
  USER_ASSIGNMENT_RESUBMIT: 'USER_ASSIGNMENT_RESUBMIT',
  USER_SCORM_COMPLETED: 'USER_SCORM_COMPLETED',
  USER_SCORM_RESET: 'USER_SCORM_RESET',
  NOTIFICATION_CREATION: 'NOTIFICATION_CREATION',
  NOTIFICATION_DELETION: 'NOTIFICATION_DELETION',
  NOTIFICATION_UNDELETE: 'NOTIFICATION_UNDELETE',
  NOTIFICATION_UPDATE: 'NOTIFICATION_UPDATE',
  USER_DOWNLOAD: 'USER_DOWNLOAD',
  IMPORT_DATA: 'IMPORT_DATA',
  EXPORT_DATA: 'EXPORT_DATA',
};
export const SOCKET_DISCUSSION_EVENTS = {
  DISCUSSION: 'DISCUSSION',
  DISCUSSION_UPDATED: 'DISCUSSION_UPDATED',
  DISCUSSION_DELETED: 'DISCUSSION_DELETED',
};

export const CHAT_MESSAGE_TYPE = {
  MESSAGE: 'MESSAGE',
};

export const CHAT_MESSAGE_STATUS = {
  ACTIVE: 'ACTIVE',
  TRASHED: 'TRASHED',
  DELETED: 'DELETED',
};

export const CHAT_GROUP_STATUS = {
  ACTIVE: 'ACTIVE',
  DELETED: 'DELETED',
};

export const CHAT_GROUP_TYPE = {
  COURSE: 'COURSE',
  USER: 'USER',
};

export const SOCKET_ERROR = {
  UNAUTHORIZED: 'Unauthorized',
};

export const CHAT_SOCKET_NAMESPACE = '/chat';
export const DISCUSSION_SOCKET_NAMESPACE = '/discussion';
export const GROUP_CHAT_SOCKET_NAMESPACE = '/group-chat';

export const AUTH_ERRORS = {
  PERMISSION_DENIED: 'PermissionDenied',
  UNAUTHORIZED: 'Unauthorized',
};
export const IMAGE_DIMENSION = [1920, 1366, 768, 320, 100];
export const BCRYPT_SALT_ROUNDS = 12;
export const USER_MIN_PASSWORD_LENGTH = 4;
export const USER_JWT_DEFAULT_EXPIRE_DURATION = '10d';
export const USERNAME_MAX_LENGTH = 150;
export const TITLE_MAX_LENGTH = 150;
export const USER_EMAIL_MAX_LENGTH = 150;
export const USER_FIRST_NAME_MAX_LENGTH = 50;
export const USER_LAST_NAME_MAX_LENGTH = 50;
export const USER_BIO_NAME_MAX_LENGTH = 1000;
export const FORGOT_PASSWORD_EXPIRE_DURATION = '15m';

export const ORDER_BY = {
  desc: -1,
  asc: 1,
};

export const USER_ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  INSTRUCTOR: 'INSTRUCTOR',
  LEARNER: 'LEARNER',
};
export const USER_ROLES_NOTIFICATION = {
  ALL: 'ALL',
  ADMIN: 'ADMIN',
  INSTRUCTOR: 'INSTRUCTOR',
  LEARNER: 'LEARNER',
};

export const USER_ROLE_NAMES = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Administrator',
  INSTRUCTOR: 'Instructor',
  LEARNER: 'Learner',
};

export const USER_TYPE_UNIT_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
};

export const USER_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  DELETED: 'DELETED',
  PERMANENTLY_DELETED: 'PERMANENTLY_DELETED',
};

export const UNIT_STATUS_SUBMISSION = {
  USER: 'USER',
  GROUP: 'GROUP'
};
export const UNIT_STATUS_SUBMISSION_TYPE = {
  USER: 'USER',
  CAPTAIN: 'CAPTAIN'
};

export const UNIT_TYPE = {
  CONTENT: 'CONTENT',
  WEBPAGE: 'WEBPAGE',
  VIDEO: 'VIDEO',
  AUDIO: 'AUDIO',
  DOCUMENT: 'DOCUMENT',
  SCORM: 'SCORM',
  IFRAME: 'IFRAME',
  TEST: 'TEST',
  SURVEY: 'SURVEY',
  ASSIGNMENT: 'ASSIGNMENT',
  LIVESTREAMING: 'LIVESTREAMING',
  CLASSROOM: 'CLASSROOM',
  LINK: 'LINK',
  SECTION: 'SECTION',
  FILES: 'FILES'
};
export const STATUS_FILES = {
  EXPIRED: 'EXPIRED',
  UPCOMING: 'UPCOMING',
  PERMISSION: 'PERMISSION',
  APPROVED: 'APPROVED'
};
export const UNIT_DATA_TYPE = {
  LINK: 'LINK',
  VIDEO: 'VIDEO',
  AUDIO: 'AUDIO',
  PRESENTATION: 'PRESENTATION',
};
export const UNIT_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  DELETED: 'DELETED',
  COURSEDELETED: 'COURSEDELETED',
  DRAFT: 'DRAFT'
};
export const USER_UNIT_STATUS = {
  COMPLETED: 'COMPLETED',
  INACTIVE: 'FAILED',
  PENDING: 'PENDING',
  RESUBMIT: 'RESUBMIT',
};
export const USER_QUESTION_STATUS = {
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  PENDING: 'PENDING',
};
export const ANSWER_TYPE = {
  select: 'SELECT',
  input: 'INPUT'
};
export const RESULT_TYPE = {
  COMPLETE: 'COMPLETE', // Question complete for unit
  CONTENT: 'CONTENT' // Question complete for unit content
};
export const CONDITION_TYPE = {
  CONTAIN: 'CONTAIN',
  NOT_CONTAIN: 'NOT_CONTAIN'
};
export const COMPLETE_TYPE = {
  CHECKBOX: 'CHECKBOX',
  QUESTION: 'QUESTION',
  TIME: 'TIME',
  INSTRUCTOR_ACCEPT: 'INSTRUCTOR_ACCEPT',
  UPLOADING_ANSWER: 'UPLOADING_ANSWER',
};
export const QUESTION_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  DELETED: 'DELETED',
};
export const LOCATION_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  DELETED: 'DELETED',
};
export const ZOOM_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  DELETED: 'DELETED',
};
export const ZOOM_STATUS_LIVE = {
  ONLINE: 'ONLINE',
  OFFLINE: 'OFFLINE'
};
export const USER_ZOOM_STATUS_LIVE = {
  JOINED: 'JOINED',
  WAITING: 'WAITING',
  LEFT: 'LEFT'
};
export const ROOM_STATUS = {
  LIVING: 'LIVING',
  STOP: 'STOP',
  PENDING: 'PENDING',
};
export const ZOOM_EVENT = {
  started: 'meeting.started',
  ended: 'meeting.ended',
  joined: 'meeting.participant_joined',
  left: 'meeting.participant_left',
  completed: 'recording.completed',
};
export const QUESTION_TYPE = {
  MTC: 'MTC',
  IMPORTMTC: 'IMPORTMTC',
  FILLTHEGAP: 'FILLTHEGAP',
  ORDERING: 'ORDERING',
  DRAGDROP: 'DRAGDROP',
  FREETEXT: 'FREETEXT',
  RANDOMIZED: 'RANDOMIZED',
};
export const SURVEY_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  DELETED: 'DELETED',
};
export const FILE_STATUS = {
  PRIVATE: 'PRIVATE',
  SHARED: 'SHARED'
};
export const FILE_TYPE = {
  IMAGE: 'IMAGE',
  AUDIO: 'AUDIO',
  VIDEO: 'VIDEO',
  PRESENTATION: 'PRESENTATION',
  SCORM: 'SCORM',
  OTHER: 'OTHER',
};
export const SECTION_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  DELETED: 'DELETED',
};

export const LANGUAGE_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
};

export const UNIT_CLASSROOM_STATUS = {
  DRAFT: 'DRAFT',
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  DELETED: 'DELETED',
};

export const TEACHING_LANGUAGE_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
};

export const TIMEZONE_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
};

export const CATEGORY_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  DELETED: 'DELETED',
};

export const GROUP_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  DELETED: 'DELETED',
};

export const USER_GROUP_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  DELETED: 'DELETED',
  GROUPDELETED: 'GROUPDELETED',
};

export const COURSE_RULES_AND_PATH_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  DELETED: 'DELETED',
};

export const COURSE_RULES_AND_PATH_SHOW_UNITS = {
  IN_ANY_ORDER: 'IN_ANY_ORDER',
  IN_SEQUENTIAL_ORDER: 'IN_SEQUENTIAL_ORDER',
};

export const COURSE_RULES_AND_PATH_COMPLETED_WHEN = {
  ALL_UNITS_ARE_COMPLETED: 'ALL_UNITS_ARE_COMPLETED',
  A_PERCENTAGE_OF_UNIT_ARE_COMPLETED: 'A_PERCENTAGE_OF_UNIT_ARE_COMPLETED',
  SELECTED_UNITS_ARE_COMPLETED: 'SELECTED_UNITS_ARE_COMPLETED',
  SELECTED_TEST_IS_PASSED: 'SELECTED_TEST_IS_PASSED',
};

export const COURSE_RULES_AND_PATH_CALCULATE_SCORE_BY_AVERAGE_OF = {
  ALL_TESTS_AND_ASSIGNMENTS: 'ALL_TESTS_AND_ASSIGNMENTS',
  TESTS_ONLY: 'TESTS_ONLY',
  TESTS_AND_ASSIGNMENTS_CHOOSE: 'TESTS_AND_ASSIGNMENTS_CHOOSE',
};

export const DISCUSSION_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  DELETED: 'DELETED',
};

export const NOTIFICATION_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  DELETED: 'DELETED',
};
export const NOTIFICATION_LOG_STATUS = {
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  DELIVERED: 'DELIVERED',
  DROPPED: 'DROPPED',
  DEFERRED: 'DEFERRED',
  BOUNCE: 'BOUNCE',
  BLOCKED: 'BLOCKED',
  OPEN: 'OPEN',
  CLICK: 'CLICK',
  SPAM_REPORT: 'SPAM_REPORT'
};

export const NOTIFICATION_EVENT = {
  REGISTRY_ACCOUNT: 'REGISTRY_ACCOUNT',
  DELETE_ACCOUNT: 'DELETE_ACCOUNT',
  CHANGE_PASSWORD_ACCOUNT: 'CHANGE_PASSWORD_ACCOUNT',
  RESET_PASSWORD: 'RESET_PASSWORD',
  ADD_TO_COURSE: 'ADD_TO_COURSE',
  ADD_TO_INTAKE: 'ADD_TO_INTAKE',
  ADD_TO_EVENT: 'ADD_TO_EVENT',
  REMOVE_FROM_COURSE: 'REMOVE_FROM_COURSE',
  REMOVE_FROM_INTAKE: 'REMOVE_FROM_INTAKE',
  REMOVE_FROM_EVENT: 'REMOVE_FROM_EVENT',
  COURSE_DELETED: 'COURSE_DELETED',
  INTAKE_DELETED: 'INTAKE_DELETED',
  EVENT_DELETED: 'EVENT_DELETED',
  EVENT_STARTED: 'EVENT_STARTED',
  USER_COMPLETED_COURSE: 'USER_COMPLETED_COURSE',
  USER_COMPLETED_TEST: 'USER_COMPLETED_TEST',
  USER_COMPLETED_SURVEY: 'USER_COMPLETED_SURVEY',
  USER_COMPLETED_ASSIGNMENT: 'USER_COMPLETED_ASSIGNMENT',
  USER_COMPLETED_SCORM: 'USER_COMPLETED_SCORM',
  INSTRUCTOR_GRADING: 'INSTRUCTOR_GRADING',
  ADD_DISCUSSION: 'ADD_DISCUSSION',
  REPLY_DISCUSSION: 'REPLY_DISCUSSION',
  REPLY_COMMENT_DISCUSSION: 'REPLY_COMMENT_DISCUSSION',
};

export const NOTIFICATION_DATA_SYSTEM = {
  date: 'date',
  site_name: 'site_name',
  site_url: 'site_url',
  admin_email: 'admin_email',
  admin_name: 'admin_name',
  footer_notification: 'footer_notification',
};

export const NOTIFICATION_DATA_USER_RES = {
  user_password: 'user_password',
};
export const NOTIFICATION_DATA_USER_RESET = {
  reset_url: 'reset_url',
};

export const NOTIFICATION_DATA_USER_INFO = {
  user_email: 'user_email',
  user_fullName: 'user_fullName',
  user_firstName: 'user_firstName',
  user_lastName: 'user_lastName',
};
export const NOTIFICATION_DATA_COURSE = {
  course_name: 'course_name',
  course_url: 'course_url'
};
export const NOTIFICATION_DATA_COURSE_GRADING = {
  course_grading: 'course_grading',
};
export const NOTIFICATION_DATA_UNIT = {
  unit_name: 'unit_name',
  unit_url: 'unit_url',
};

export const NOTIFICATION_DATA_TEST = {
  test_result: 'test_result',
};

export const NOTIFICATION_DATA_SURVEY = {
  survey_result: 'survey_result',
};

export const NOTIFICATION_DATA_ASSIGNMENT = {
  assignment_result: 'assignment_result',
};

export const NOTIFICATION_DATA_SCORM = {
  scorm_result: 'scorm_result',
};

export const NOTIFICATION_DATA_DISCUSSION = {
  discussion_name: 'discussion_name',
  discussion_link: 'discussion_link',
  firstName_user_send: 'firstName_user_send',
  lastName_user_send: 'lastName_user_send',
  fullName_user_send: 'fullName_user_send',
  email_user_send: 'email_user_send'
};

export const NOTIFICATION_DATA_REPLY_DISCUSSION = {
  reply_discussion_link: 'reply_discussion_link'
};

export const NOTIFICATION_DATA_REPLY_COMMENT_DISCUSSION = {
  reply_comment_discussion_link: 'reply_comment_discussion_link'
};

export const NOTIFICATION_DATA_EVENT = {
  event_name: 'event_name',
};

export const NOTIFICATION_SYSTEM_DATA = {
  REGISTRY_ACCOUNT: {
    name: '{admin_name} has invited you to use {site_name}.',
    message: 'Hi Ms/Mr {user_firstName},\n\n{admin_name} has invited you to use {site_name}.\nPlease use the following user information to login:\nEmail: <strong>{user_email}</strong>\nPassword: <strong>{user_password}</strong>\n<i>This email was sent from {site_url} at {date}</i>\n\nMany thanks.\n',
  },
  RESET_PASSWORD: {
    name: 'Forgot your password?',
    message: 'Hi Ms/Mr {user_firstName},\n\nCan\'t remember your username for: <a href="{site_url}">{site_name}</a>? Don’t worry, it happens to all of us.\nYou can reset password as: <a href="{reset_url}">Forgot your password</a>\n\n<i>If you didn’t make a request for this reminder, you don’t need to do anything, and can safely ignore this email.</i>',
  },
  DELETE_ACCOUNT: {
    name: 'Your account has been deleted',
    message: 'Hi Ms/Mr {user_firstName},\nYour account has been deleted. Please check it carefully to make sure this is your change!\nMany thanks.\n',
  }
};

export const DISCUSSION_FILES_STATUS = {
  ACTIVE: 'ACTIVE',
  WAITING_DELETE: 'WAITING_DELETE',
};

export const COURSE_USER_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  DELETED: 'DELETED',
  COMPLETED: 'COMPLETED',
  IN_PROGRESS: 'IN_PROGRESS',
};

export const SESSION_USER_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  DELETED: 'DELETED',
  COURSEDELETED: 'COURSEDELETED',
  UNITDELETED: 'UNITDELETED',
  EVENTDELETED: 'EVENTDELETED',
};

export const SESSION_USER_GRADE_STATUS = {
  PASSED: 'PASSED',
  NOT_PASSED: 'NOT_PASSED',
  PENDING: 'PENDING',
};
export const SESSION_USER_MAPPING_UNIT = {
  PASSED: 'COMPLETED',
  NOT_PASSED: 'FAILED',
  PENDING: 'PENDING',
};

export const SESSION_USER_ATTENDANCE = {
  JOINED: 'JOINED',
  MISSING: 'MISSING',
  PENDING: 'PENDING',
};

export const COURSE_USER_ORDER_FIELDS = {
  fullName: 'fullName',
  role: 'courseUsers.userRole',
};
export const COURSE_ORDER_FIELDS = {
  name: 'name',
  code: 'code',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  category: 'category.name',
};

export const NOTIFICATION_ORDER_FIELDS = {
  recipient: 'recipient',
  subject: 'subject',
  status: 'status',
  createdAt: 'createdAt',
};

export const USER_FOR_SESSION_ORDER_FIELDS = {
  fullName: 'fullName',
  session: 'sessionUsers.name',
};
export const USER_ORDER_FIELDS = {
  fullName: 'fullName',
  email: 'email',
  lastLogin: 'lastLogin',
  status: 'status',
  createdAt: 'createdAt',
};

export const USER_REPORT_ORDER_FIELDS = {
  fullName: 'fullName',
  email: 'email',
  assignedCourses: 'assignedCourses',
  completedCourses: 'completedCourses',
  points: 'points',
  type: 'type.name'
};

export const COURSE_REPORT_ORDER_FIELDS = {
  name: 'name',
  code: 'code',
  category: 'category.name',
  assignedLearners: 'assignedLearners',
  completedLearners: 'completedLearners'
};

export const COURSE_REPORT_FILTER_FIELDS = {
  COURSE: 'COURSE',
  INTAKE: 'INTAKE'
};

export const TEST_REPORT_ORDER_FIELDS = {
  title: 'title',
  course: 'course.name',
  completed: 'total',
  passed: 'completed',
  avg: 'avg_position'
};

export const DETAIL_TEST_REPORT_ODER_FIELDS = {
  points: 'points',
  count: 'unit.count',
  start_time: 'unit.start_time',
  fullName: 'user.fullName',
  status: 'status'
};

export const DETAIL_SURVEY_REPORT_ORDER_FIELDS = {
  fullName: 'user.fullName',
  createdAt: 'createdAt',
  status: 'status'
};

export const DETAIL_ASSIGNMENT_REPORT_ORDER_FIELDS = {
  fullName: 'user.fullName',
  createdAt: 'createdAt',
  grade: 'result.grade',
  status: 'status'
};

export const DETAIL_SCORM_REPORT_ORDER_FIELDS = {
  fullName: 'user.fullName',
  createdAt: 'createdAt',
  score: 'result.score',
  status: 'status'
};

export const SURVEY_REPORT_ORDER_FIELDS = {
  title: 'title',
  course: 'course.name',
  completed: 'total'
};

export const ASSIGNMENT_REPORT_ORDER_FIELDS = {
  title: 'title',
  course: 'course.name',
  submission: 'total',
  passed: 'completed',
  avg: 'avg_position'
};

export const SCORM_REPORT_ORDER_FIELDS = {
  title: 'title',
  course: 'course.name',
  completed: 'total',
  passed: 'completed',
};

export const USER_COURSE_ORDER_FIELDS = {
  course: 'course.name',
  progress: 'progress',
  score: 'score',
  enrolledDate: 'enrolledDate',
  completionDate: 'completionDate'
};

export const COURSE_USER_ORDER_FIELDS_SORT = {
  user: 'user.fullName',
  progress: 'progress',
  score: 'score',
  enrolledDate: 'enrolledDate',
  completionDate: 'completionDate'
};

export const ZOOM_ORDER_FIELDS = {
  zoom_client: 'zoom_client',
  zoom_key: 'zoom_key',
  zoom_sec: 'zoom_sec',
  zoom_webhook: 'zoom_webhook',
  status: 'status',
  statusLive: 'statusLive'
};
export const COURSE_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  DELETED: 'DELETED',
};
export const TIME_SELECT_LOGIN = {
  HOUR: 'HOUR',
  FOURHOURS: 'FOURHOURS',
  TODAY: 'TODAY',
  THREEDAY: 'THREEDAY',
  WEEK: 'WEEK',
  MONTH: 'MONTH'
};

export const USER_TYPE_STATUS = {
  ACTIVE: 'ACTIVE',
  DELETED: 'DELETED',
};

export const USER_TYPE_UNIT_STATUS = {
  ACTIVE: 'ACTIVE',
  DELETED: 'DELETED',
};

export const USER_SETTING_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
};

export const USER_EVENT_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  DELETED: 'DELETED',
  COURSEDELETED: 'COURSEDELETED',
  UNITDELETED: 'UNITDELETED',
};
export const LIVESTREAM_TYPE = {
  BBB: 'BBB',
  ZOOM: 'ZOOM',
};

export const USER_ROOM_STATUS = {
  NEW: 'NEW',
  RUNNING: 'RUNNING',
  ENDED: 'ENDED',
};

export const USER_EVENT_TYPE = {
  EVENT: 'EVENT',
  CLASSROOM: 'CLASSROOM',
  WEBINAR: 'WEBINAR',
};
export const TIMEZOME_DEFAULT = 'Asia/Singapore';
export const USER_EVENT_FILES_STATUS = {
  ACTIVE: 'ACTIVE',
  WAITING_DELETE: 'WAITING_DELETE',
};

export const FILE_SHARE_TYPE = {
  PRIVATE: 'PRIVATE',
  GROUP: 'GROUP',
  PUBLIC: 'PUBLIC',
  CUSTOM: 'CUSTOM',
};

export const USER_EVENT_PRIVACY = {
  PRIVATE: 'PRIVATE',
  PUBLIC: 'PUBLIC',
  CUSTOM: 'CUSTOM',
};
export const USER_EVENT = {
  REGISTRY: 'REGISTRY',
  ALL: 'ALL',
  CUSTOM: 'CUSTOM',
};
export const USER_FILE = {
  ALL: 'ALL',
  CUSTOM: 'CUSTOM',
  GROUP: 'GROUP'
};
export const USER_GROUP_TYPE = {
  USER: 'USER',
  CAPTAIN: 'CAPTAIN'
};
export const ROOM_GUEST_POLICY = {
  ALWAYS_ACCEPT: 'ALWAYS_ACCEPT',
  ALWAYS_DENY: 'ALWAYS_DENY',
  ASK_MODERATOR: 'ASK_MODERATOR',
};

export const ROOM_VIEWER_ROLES = {
  MODERATOR: 'MODERATOR',
  VIEWER: 'VIEWER',
};

export const EMAIL_COMMON_FIELDS = {
  emailSignature: `
    <br>
    Best regards,<br>
    MindChamps LMS<br>
    Email: <span style="color: #1188e6"><a href="mailto:enrichmentlms@mindchamps.org">enrichmentlms@mindchamps.org</a></span>
  `,
  companyName: 'LMS Edutek',
  website: 'https://lms.edutek.io',
};
export const FOOTER_NOTIFICATION = `
    Best regards,<br>
    MindChamps LMS<br>
    Email: <span style="color: #1188e6"><a href="mailto:enrichmentlms@mindchamps.org">enrichmentlms@mindchamps.org</a></span>
  `;

export const DEFAULT_LANGUAGES = [
  {
    name: 'Tiếng Việt',
    value: 'vi',
  },
  {
    name: 'English',
    value: 'en',
  },
];

export const DEFAULT_TEACHING_LANGUAGES = [
  {
    name: 'Tiếng Việt',
    value: 'vi',
  },
  {
    name: 'English',
    value: 'en',
  },
];
export const DEFAULT_COURSE_LANGUAGES = 'en';

export const DEFAULT_PERMISSIONS = [
  {
    name: 'Administrator',
    role: USER_ROLES.ADMIN,
    children: [
      {
        name: 'Users',
        children: [
          {
            name: 'View',
            routes: [
              {
                method: USER_TYPE_UNIT_METHODS.GET,
                route: 'users',
              },
              {
                method: USER_TYPE_UNIT_METHODS.GET,
                route: 'users/:id',
              },
            ],
          },
          {
            name: 'Create',
            routes: [
              {
                method: USER_TYPE_UNIT_METHODS.POST,
                route: 'users',
              },
            ],
          },
          {
            name: 'Update',
            dependencies: [0],
            routes: [
              {
                method: USER_TYPE_UNIT_METHODS.PUT,
                route: 'users/:id',
              },
            ],
          },
          {
            name: 'Delete',
            dependencies: [0],
            routes: [
              {
                method: USER_TYPE_UNIT_METHODS.DELETE,
                route: 'users/:id',
              },
              {
                method: USER_TYPE_UNIT_METHODS.DELETE,
                route: 'users/:id/permanently',
              },
            ],
          },
        ],
      },
      {
        name: 'Courses',
        children: [
          {
            name: 'View',
            routes: [
              {
                method: USER_TYPE_UNIT_METHODS.GET,
                route: 'courses',
              },
              {
                method: USER_TYPE_UNIT_METHODS.GET,
                route: 'courses/:id',
              },
            ],
          },
          {
            name: 'Create',
            routes: [
              {
                method: USER_TYPE_UNIT_METHODS.POST,
                route: 'courses',
              },
              {
                method: USER_TYPE_UNIT_METHODS.GET,
                route: 'courses/:id',
              }
            ],
          },
          {
            name: 'Update',
            dependencies: [0],
            routes: [
              {
                method: USER_TYPE_UNIT_METHODS.PUT,
                route: 'courses/:id',
              },
            ],
          },
          {
            name: 'Delete',
            dependencies: [0],
            routes: [
              {
                method: USER_TYPE_UNIT_METHODS.DELETE,
                route: 'courses/:id',
              },
            ],
          },
          {
            name: 'Units',
            children: [
              {
                name: 'View',
                routes: [
                  {
                    method: USER_TYPE_UNIT_METHODS.GET,
                    route: 'units/get-units'
                  },
                  {
                    method: USER_TYPE_UNIT_METHODS.GET,
                    route: 'user-courses/get-units'
                  },
                  {
                    method: USER_TYPE_UNIT_METHODS.GET,
                    route: 'user-courses/get-unit'
                  },
                  {
                    method: USER_TYPE_UNIT_METHODS.GET,
                    route: 'units/get-units'
                  }
                ]
              },
              {
                name: 'Create',
                routes: [
                  {
                    method: USER_TYPE_UNIT_METHODS.POST,
                    route: 'units',
                  }
                ]
              },
              {
                name: 'Update',
                routes: [
                  {
                    method: USER_TYPE_UNIT_METHODS.PUT,
                    route: 'units/quick-update'
                  },
                  {
                    method: USER_TYPE_UNIT_METHODS.PUT,
                    route: 'units'
                  }
                ]
              },
              {
                name: 'Delete',
                routes: {
                  method: USER_TYPE_UNIT_METHODS.DELETE,
                  route: 'units'
                }
              }
            ]
          },
          {
            name: 'Rules and Path',
            children: [
              {
                name: 'View',
                routes: [
                  {
                    method: USER_TYPE_UNIT_METHODS.GET,
                    route: 'course-rules-and-path'
                  }
                ]
              },
              {
                name: 'Update',
                routes: [
                  {
                    method: USER_TYPE_UNIT_METHODS.PUT,
                    route: 'course-rules-and-path/:id'
                  }
                ]
              }
            ]
          },
          {
            name: 'Users',
            children: [
              {
                name: 'View',
                routes: [
                  {
                    method: USER_TYPE_UNIT_METHODS.GET,
                    route: 'course-users/:id/users'
                  }
                ]
              },
              {
                name: 'Add',
                dependencies: [0],
                routes: [
                  {
                    method: USER_TYPE_UNIT_METHODS.POST,
                    route: 'course-users'
                  }
                ]
              },
              {
                name: 'Remove',
                dependencies: [0],
                routes: [
                  {
                    method: USER_TYPE_UNIT_METHODS.DELETE,
                    route: 'course-users/:id'
                  }
                ]
              },
              {
                name: 'Change role',
                dependencies: [0],
                routes: [
                  {
                    method: USER_TYPE_UNIT_METHODS.PUT,
                    route: 'course-users/:id'
                  }
                ]
              }
            ]
          }
        ],
      },
      {
        name: 'Intakes',
        children: [
          {
            name: 'View',
            routes: [
              {
                method: USER_TYPE_UNIT_METHODS.GET,
                route: 'intakes',
              }
            ],
          },
          {
            name: 'Create',
            routes: [
              {
                method: USER_TYPE_UNIT_METHODS.POST,
                route: 'intakes',
              },
            ],
          },
        ],
      },
      {
        name: 'Calendar',
        children: [
          {
            name: 'View',
            routes: [
              {
                method: USER_TYPE_UNIT_METHODS.GET,
                route: 'user-events'
              },
              {
                method: USER_TYPE_UNIT_METHODS.GET,
                route: 'user-events/:id'
              },
              {
                method: USER_TYPE_UNIT_METHODS.GET,
                route: 'classroom-sessions/:id/search'
              },
              {
                method: USER_TYPE_UNIT_METHODS.GET,
                route: 'session-users/:id/users'
              },
              {
                method: USER_TYPE_UNIT_METHODS.GET,
                route: 'course-users/search-course-users'
              }
            ]
          },
          {
            name: 'Create',
            dependencies: [0],
            routes: [
              {
                method: USER_TYPE_UNIT_METHODS.POST,
                route: 'user-events'
              }
            ]
          },
          {
            name: 'Update',
            dependencies: [0],
            routes: [
              {
                method: USER_TYPE_UNIT_METHODS.PUT,
                route: 'user-events/:id'
              }
            ]
          },
          {
            name: 'Delete',
            dependencies: [0],
            routes: [
              {
                method: USER_TYPE_UNIT_METHODS.DELETE,
                route: 'user-events/:id'
              }
            ]
          },
          {
            name: 'Attendance',
            children: [
              {
                name: 'View',
                routes: [
                  {
                    name: USER_TYPE_UNIT_METHODS.GET,
                    route: 'session-users/:id/users'
                  }
                ]
              },
              {
                name: 'Update',
                dependencies: [0],
                routes: [
                  {
                    name: USER_TYPE_UNIT_METHODS.PUT,
                    route: 'session-users/:id'
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        name: 'Categories',
        children: [
          {
            name: 'Create',
            routes: [
              {
                method: USER_TYPE_UNIT_METHODS.POST,
                route: 'categories',
              },
            ],
          },
          {
            name: 'Update',
            dependencies: [0],
            routes: [
              {
                method: USER_TYPE_UNIT_METHODS.PUT,
                route: 'categories/:id',
              },
            ],
          },
          {
            name: 'Delete',
            dependencies: [0],
            routes: [
              {
                method: USER_TYPE_UNIT_METHODS.DELETE,
                route: 'categories/:id',
              },
            ],
          },
        ],
      },
      {
        name: 'Locations',
        children: [
          {
            name: 'Create',
            routes: [
              {
                method: USER_TYPE_UNIT_METHODS.POST,
                route: 'locations',
              },
            ],
          },
          {
            name: 'Update',
            dependencies: [0],
            routes: [
              {
                method: USER_TYPE_UNIT_METHODS.PUT,
                route: 'locations/:id',
              },
            ],
          },
          {
            name: 'Delete',
            dependencies: [0],
            routes: [
              {
                method: USER_TYPE_UNIT_METHODS.DELETE,
                route: 'locations/:id',
              },
            ],
          },
        ],
      },
      {
        name: 'Groups',
        children: [
          {
            name: 'View',
            routes: [
              {
                method: USER_TYPE_UNIT_METHODS.GET,
                route: 'course-groups',
              },
            ],
          },
          {
            name: 'Create',
            routes: [
              {
                method: USER_TYPE_UNIT_METHODS.POST,
                route: 'course-groups',
              },
            ],
          },
          {
            name: 'Update',
            dependencies: [0],
            routes: [
              {
                method: USER_TYPE_UNIT_METHODS.PUT,
                route: 'course-groups/:id',
              },
            ],
          },
          {
            name: 'Delete',
            dependencies: [0],
            routes: [
              {
                method: USER_TYPE_UNIT_METHODS.DELETE,
                route: 'course-groups/:id',
              },
            ],
          },
        ],
      },
      {
        name: 'Import - Export',
        children: [
          {
            name: 'Import',
            routes: [
              {
                method: USER_TYPE_UNIT_METHODS.POST,
                route: 'users/check-import',
              },
              {
                method: USER_TYPE_UNIT_METHODS.POST,
                route: 'users/import',
              },
            ],
          },
          {
            name: 'Export',
            routes: [
              {
                method: USER_TYPE_UNIT_METHODS.GET,
                route: 'users/export',
              },
            ],
          },
        ],
      },
      {
        name: 'User types',
        children: [
          {
            name: 'View',
            routes: [
              {
                method: USER_TYPE_UNIT_METHODS.GET,
                route: 'user-types',
              },
              {
                method: USER_TYPE_UNIT_METHODS.GET,
                route: 'user-types/:id',
              },
              {
                method: USER_TYPE_UNIT_METHODS.GET,
                route: 'user-type-units'
              }
            ],
          },
          {
            name: 'Create',
            dependencies: [0],
            routes: [
              {
                method: USER_TYPE_UNIT_METHODS.POST,
                route: 'user-types',
              },
              {
                method: USER_TYPE_UNIT_METHODS.POST,
                route: 'user-type-units',
              },
            ],
          },
          {
            name: 'Update',
            dependencies: [0],
            routes: [
              {
                method: USER_TYPE_UNIT_METHODS.PUT,
                route: 'user-types/:id',
              },
            ],
          },
          {
            name: 'Delete',
            dependencies: [0],
            routes: [
              {
                method: USER_TYPE_UNIT_METHODS.DELETE,
                route: 'user-types/:id',
              },
            ],
          },
        ],
      },
      {
        name: 'Reports',
        children: [
          {
            name: 'Users',
            children: [
              {
                name: 'View',
                routes: [
                  {
                    method: USER_TYPE_UNIT_METHODS.GET,
                    route: 'reports/users/summaries'
                  },
                  {
                    method: USER_TYPE_UNIT_METHODS.GET,
                    route: 'reports/users'
                  },
                  {
                    method: USER_TYPE_UNIT_METHODS.GET,
                    route: 'reports/users/:id'
                  },
                  {
                    method: USER_TYPE_UNIT_METHODS.GET,
                    route: 'reports/users/:id/courses'
                  }
                ]
              }
            ]
          },
          {
            name: 'Courses',
            children: [
              {
                name: 'View',
                routes: [
                  {
                    method: USER_TYPE_UNIT_METHODS.GET,
                    route: 'reports/courses/summaries'
                  },
                  {
                    method: USER_TYPE_UNIT_METHODS.GET,
                    route: 'reports/courses'
                  },
                  {
                    method: USER_TYPE_UNIT_METHODS.GET,
                    route: 'reports/courses/:id'
                  },
                  {
                    method: USER_TYPE_UNIT_METHODS.GET,
                    route: 'reports/courses/:id/users'
                  }
                ]
              }
            ]
          },
          {
            name: 'Tests',
            children: [
              {
                name: 'View',
                routes: [
                  {
                    method: USER_TYPE_UNIT_METHODS.GET,
                    route: 'report/get-report-test'
                  },
                  {
                    method: USER_TYPE_UNIT_METHODS.GET,
                    route: 'report/get-report-test'
                  },
                  {
                    method: USER_TYPE_UNIT_METHODS.GET,
                    route: 'report/get-report-test-detail'
                  },
                ]
              }
            ]
          },
          {
            name: 'Assignments',
            children: [
              {
                name: 'View',
                routes: [
                  {
                    method: USER_TYPE_UNIT_METHODS.GET,
                    route: 'report/get-report-assignment'
                  },
                  {
                    method: USER_TYPE_UNIT_METHODS.GET,
                    route: 'report/get-report-assignment'
                  },
                  {
                    method: USER_TYPE_UNIT_METHODS.GET,
                    route: 'report/get-report-assignment-detail'
                  },
                ]
              }
            ]
          },
          {
            name: 'Surveys',
            children: [
              {
                name: 'View',
                routes: [
                  {
                    method: USER_TYPE_UNIT_METHODS.GET,
                    route: 'report/get-report-survey'
                  },
                  {
                    method: USER_TYPE_UNIT_METHODS.GET,
                    route: 'report/get-report-survey'
                  },
                  {
                    method: USER_TYPE_UNIT_METHODS.GET,
                    route: 'report/get-report-survey-detail'
                  },
                ]
              }
            ]
          },
        ],
      },
    ],
  },
  {
    name: 'Instructor',
    role: USER_ROLES.INSTRUCTOR,
    children: [
      {
        name: 'Courses',
        children: [
          {
            name: 'View',
            routes: [
              {
                method: USER_TYPE_UNIT_METHODS.GET,
                route: 'courses',
              },
              {
                method: USER_TYPE_UNIT_METHODS.GET,
                route: 'courses/:id',
              },
            ],
          },
          {
            name: 'Create',
            routes: [
              {
                method: USER_TYPE_UNIT_METHODS.POST,
                route: 'courses',
              },
              {
                method: USER_TYPE_UNIT_METHODS.GET,
                route: 'courses/:id',
              },
              // units
              {
                method: USER_TYPE_UNIT_METHODS.GET,
                route: 'units/get-units'
              },
              {
                method: USER_TYPE_UNIT_METHODS.GET,
                route: 'user-courses/get-units'
              },
              {
                method: USER_TYPE_UNIT_METHODS.GET,
                route: 'user-courses/get-unit'
              },
            ],
          },
          {
            name: 'Update',
            dependencies: [0],
            routes: [
              {
                method: USER_TYPE_UNIT_METHODS.PUT,
                route: 'courses/:id',
              },
            ],
          },
          {
            name: 'Delete',
            dependencies: [0],
            routes: [
              {
                method: USER_TYPE_UNIT_METHODS.DELETE,
                route: 'courses/:id',
              },
            ],
          },
          {
            name: 'Units',
            children: [
              {
                name: 'View',
                routes: [
                  {
                    method: USER_TYPE_UNIT_METHODS.GET,
                    route: 'units/get-units'
                  },
                  {
                    method: USER_TYPE_UNIT_METHODS.GET,
                    route: 'user-courses/get-units'
                  },
                  {
                    method: USER_TYPE_UNIT_METHODS.GET,
                    route: 'user-courses/get-unit'
                  },
                  {
                    method: USER_TYPE_UNIT_METHODS.GET,
                    route: 'units/get-units'
                  }
                ]
              },
              {
                name: 'Create',
                routes: [
                  {
                    method: USER_TYPE_UNIT_METHODS.POST,
                    route: 'units',
                  }
                ]
              },
              {
                name: 'Update',
                dependencies: [0],
                routes: [
                  {
                    method: USER_TYPE_UNIT_METHODS.PUT,
                    route: 'units/quick-update'
                  },
                  {
                    method: USER_TYPE_UNIT_METHODS.PUT,
                    route: 'units'
                  }
                ]
              },
              {
                name: 'Delete',
                dependencies: [0],
                routes: {
                  method: USER_TYPE_UNIT_METHODS.DELETE,
                  route: 'units'
                }
              }
            ]
          },
          {
            name: 'Rules and Path',
            children: [
              {
                name: 'View',
                routes: [
                  {
                    method: USER_TYPE_UNIT_METHODS.GET,
                    route: 'course-rules-and-path'
                  }
                ]
              },
              {
                name: 'Update',
                dependencies: [0],
                routes: [
                  {
                    method: USER_TYPE_UNIT_METHODS.PUT,
                    route: 'course-rules-and-path/:id'
                  }
                ]
              }
            ]
          },
          {
            name: 'Users',
            children: [
              {
                name: 'View',
                routes: [
                  {
                    method: USER_TYPE_UNIT_METHODS.GET,
                    route: 'course-users/:id/users'
                  }
                ]
              },
              {
                name: 'Add',
                dependencies: [0],
                routes: [
                  {
                    method: USER_TYPE_UNIT_METHODS.POST,
                    route: 'course-users'
                  }
                ]
              },
              {
                name: 'Remove',
                dependencies: [0],
                routes: [
                  {
                    method: USER_TYPE_UNIT_METHODS.DELETE,
                    route: 'course-users/:id'
                  }
                ]
              },
              {
                name: 'Change role',
                dependencies: [0],
                routes: [
                  {
                    method: USER_TYPE_UNIT_METHODS.PUT,
                    route: 'course-users/:id'
                  }
                ]
              }
            ]
          }
        ],
      },
      {
        name: 'Groups',
        children: [
          {
            name: 'View',
            routes: [
              {
                method: USER_TYPE_UNIT_METHODS.GET,
                route: 'course-groups',
              },
            ],
          },
          {
            name: 'Create',
            routes: [
              {
                method: USER_TYPE_UNIT_METHODS.POST,
                route: 'course-groups',
              },
            ],
          },
          {
            name: 'Update',
            dependencies: [0],
            routes: [
              {
                method: USER_TYPE_UNIT_METHODS.PUT,
                route: 'course-groups/:id',
              },
            ],
          },
          {
            name: 'Delete',
            dependencies: [0],
            routes: [
              {
                method: USER_TYPE_UNIT_METHODS.DELETE,
                route: 'course-groups/:id',
              },
            ],
          },
        ],
      },
      {
        name: 'Reports',
        children: [
          {
            name: 'Users',
            children: [
              {
                name: 'View',
                routes: [
                  {
                    method: USER_TYPE_UNIT_METHODS.GET,
                    route: 'reports/users/summaries'
                  },
                  {
                    method: USER_TYPE_UNIT_METHODS.GET,
                    route: 'reports/users'
                  },
                  {
                    method: USER_TYPE_UNIT_METHODS.GET,
                    route: 'reports/users/:id'
                  },
                  {
                    method: USER_TYPE_UNIT_METHODS.GET,
                    route: 'reports/users/:id/courses'
                  }
                ]
              }
            ]
          },
          {
            name: 'Courses',
            children: [
              {
                name: 'View',
                routes: [
                  {
                    method: USER_TYPE_UNIT_METHODS.GET,
                    route: 'reports/courses/summaries'
                  },
                  {
                    method: USER_TYPE_UNIT_METHODS.GET,
                    route: 'reports/courses'
                  },
                  {
                    method: USER_TYPE_UNIT_METHODS.GET,
                    route: 'reports/courses/:id'
                  },
                  {
                    method: USER_TYPE_UNIT_METHODS.GET,
                    route: 'reports/courses/:id/users'
                  }
                ]
              }
            ]
          },
          {
            name: 'Tests',
            children: [
              {
                name: 'View',
                routes: [
                  {
                    method: USER_TYPE_UNIT_METHODS.GET,
                    route: 'report/get-report-test'
                  },
                  {
                    method: USER_TYPE_UNIT_METHODS.GET,
                    route: 'report/get-report-test'
                  },
                  {
                    method: USER_TYPE_UNIT_METHODS.GET,
                    route: 'report/get-report-test-detail'
                  },
                ]
              }
            ]
          },
          {
            name: 'Assignments',
            children: [
              {
                name: 'View',
                routes: [
                  {
                    method: USER_TYPE_UNIT_METHODS.GET,
                    route: 'report/get-report-assignment'
                  },
                  {
                    method: USER_TYPE_UNIT_METHODS.GET,
                    route: 'report/get-report-assignment'
                  },
                  {
                    method: USER_TYPE_UNIT_METHODS.GET,
                    route: 'report/get-report-assignment-detail'
                  },
                ]
              }
            ]
          },
          {
            name: 'Surveys',
            children: [
              {
                name: 'View',
                routes: [
                  {
                    method: USER_TYPE_UNIT_METHODS.GET,
                    route: 'report/get-report-survey'
                  },
                  {
                    method: USER_TYPE_UNIT_METHODS.GET,
                    route: 'report/get-report-survey'
                  },
                  {
                    method: USER_TYPE_UNIT_METHODS.GET,
                    route: 'report/get-report-survey-detail'
                  },
                ]
              }
            ]
          },
        ],
      },
      {
        name: 'Calendar',
        children: [
          {
            name: 'View',
            routes: [
              {
                method: USER_TYPE_UNIT_METHODS.GET,
                route: 'user-events'
              },
              {
                method: USER_TYPE_UNIT_METHODS.GET,
                route: 'user-events/:id'
              },
              {
                method: USER_TYPE_UNIT_METHODS.GET,
                route: 'classroom-sessions/:id/search'
              },
              {
                method: USER_TYPE_UNIT_METHODS.GET,
                route: 'session-users/:id/users'
              },
              {
                method: USER_TYPE_UNIT_METHODS.GET,
                route: 'course-users/search-course-users'
              }
            ]
          },
          {
            name: 'Create',
            dependencies: [0],
            routes: [
              {
                method: USER_TYPE_UNIT_METHODS.POST,
                route: 'user-events'
              }
            ]
          },
          {
            name: 'Update',
            dependencies: [0],
            routes: [
              {
                method: USER_TYPE_UNIT_METHODS.PUT,
                route: 'user-events/:id'
              }
            ]
          },
          {
            name: 'Delete',
            dependencies: [0],
            routes: [
              {
                method: USER_TYPE_UNIT_METHODS.DELETE,
                route: 'user-events/:id'
              }
            ]
          },
          {
            name: 'Attendance',
            children: [
              {
                name: 'View',
                routes: [
                  {
                    name: USER_TYPE_UNIT_METHODS.GET,
                    route: 'session-users/:id/users'
                  }
                ]
              },
              {
                name: 'Update',
                dependencies: [0],
                routes: [
                  {
                    name: USER_TYPE_UNIT_METHODS.PUT,
                    route: 'session-users/:id'
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  {
    name: 'Learner',
    role: USER_ROLES.LEARNER,
    children: [
      {
        name: 'Courses',
        children: [
          {
            name: 'View',
            routes: [
              {
                method: USER_TYPE_UNIT_METHODS.GET,
                route: 'courses',
              },
              {
                method: USER_TYPE_UNIT_METHODS.GET,
                route: 'courses/:id',
              },
            ],
          },
          {
            name: 'Units',
            routes: [
              {
                method: USER_TYPE_UNIT_METHODS.GET,
                route: 'units/get-units'
              },
              {
                method: USER_TYPE_UNIT_METHODS.GET,
                route: 'user-courses/get-units'
              },
              {
                method: USER_TYPE_UNIT_METHODS.GET,
                route: 'user-courses/get-unit'
              },
              {
                method: USER_TYPE_UNIT_METHODS.GET,
                route: 'units/get-units'
              }
            ]
          },
          {
            name: 'Calendar',
            routes: [
              {
                method: USER_TYPE_UNIT_METHODS.GET,
                route: 'user-events'
              },
              {
                method: USER_TYPE_UNIT_METHODS.GET,
                route: 'user-events/:id'
              }
            ]
          }
        ],
      }
    ]
  }
];
