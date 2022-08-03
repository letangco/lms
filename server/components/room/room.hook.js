/**
 * Registry room event hooks
 **/
import { getUrlForRoomCall, roomRequest } from './room.util';
import logger from '../../util/logger';
import {
  addRecordToUserEvent,
  changeUserEventRoomStatus,
} from '../userEvent/userEvent.service';
import { getMeetingInfo } from './room.service';
import { ROOM_ENDPOINTS, ROOM_HOOK_RECORDED_CALLBACK_URL } from '../../config';
import { ROOM_VIEWER_ROLES, USER_ROOM_STATUS, REDIS_KEYS } from '../../constants';
import Redis from '../../util/Redis';
import { createUserEventViewTracking } from '../userEventViewTracking/userEventViewTracking.service';

const splitSymbol = ':';

async function getHookInfo(hookId) {
  try {
    const data = await Redis.get(`${REDIS_KEYS.ROOM_HOOK}${splitSymbol}${hookId}`);
    if (typeof data === 'string') {
      return JSON.parse(data);
    }
    return null;
  } catch (error) {
    throw error;
  }
}

async function deleteHookInfo(hookId) {
  try {
    await Redis.del(`${REDIS_KEYS.ROOM_HOOK}${splitSymbol}${hookId}`);
    return true;
  } catch (error) {
    throw error;
  }
}

async function setHookInfo(hookId, hookInfo) {
  try {
    const data = JSON.stringify(hookInfo);
    await Redis.set(`${REDIS_KEYS.ROOM_HOOK}${splitSymbol}${hookId}`, data);
    return true;
  } catch (error) {
    throw error;
  }
}

async function getUserTrackingInfo(meetingId, userId) {
  try {
    const data = await Redis.get(`${REDIS_KEYS.ROOM_TRACKING_INFO}${splitSymbol}${meetingId}${splitSymbol}${userId}`);
    if (typeof data === 'string') {
      return JSON.parse(data);
    }
    return null;
  } catch (error) {
    throw error;
  }
}

async function deleteUserTrackingInfo(meetingId, userId) {
  try {
    await Redis.del(`${REDIS_KEYS.ROOM_TRACKING_INFO}${splitSymbol}${meetingId}${splitSymbol}${userId}`);
    return true;
  } catch (error) {
    throw error;
  }
}

async function setUserTrackingInfo(meetingId, userId, trackingInfo) {
  try {
    const data = JSON.stringify(trackingInfo);
    await Redis.set(`${REDIS_KEYS.ROOM_TRACKING_INFO}${splitSymbol}${meetingId}${splitSymbol}${userId}`, data);
    return true;
  } catch (error) {
    throw error;
  }
}

async function getUsersOnMeeting(meetingId) {
  try {
    const scanResult = await Redis.scan('0', `${REDIS_KEYS.ROOM_TRACKING_INFO}${splitSymbol}${meetingId}${splitSymbol}*`);
    const keys = scanResult?.[1] ?? [];
    let users = keys.map((key) => {
      return key.split(splitSymbol)?.[2] ?? null;
    });
    users = users.filter(user => !!user);
    return users;
  } catch (error) {
    throw error;
  }
}

logger.logX('ROOM_ENDPOINTS');
logger.logX(ROOM_ENDPOINTS);

async function getServerEndPoint(meetingID) {
  try {
    const length = ROOM_ENDPOINTS.length;
    for (let i = 0; i < length; i++) {
      const endpoint = ROOM_ENDPOINTS[i];
      const room = await getMeetingInfo({
        meetingID: meetingID,
        endpoint: endpoint,
      });
      if (room?.meetingID) {
        return endpoint;
      }
    }
    return null;
  } catch (error) {
    logger.error(`RoomHook getServerEndPoint, error: ${error.toString()}`);
    throw error;
  }
}

/**
 * Registry hook for balance
 * @param params
 * @param {String} params.callbackURL The URL that will receive a POST call with the events.
 *                                    The same URL cannot be registered more than once.
 * @param {String} params.meetingID The meetingID to bind this hook to an specific meeting.
 *                                  If not informed, the hook will receive events for all meetings.
 * @param {String} params.internalMeetingID The internal meetingID to store this hook
 * @param {String} params.endpoint Server endpoint
 * @param {Boolean|option} params.getRaw false by default.
 *                                When getRaw=true, the POST call will contain the exact same message sent on redis, otherwise the message will be processed.
 * @returns {Promise<*>}
 */
export async function registryHook(params) {
  try {
    logger.logX('registryHook');
    // Get the meeting ENDPOINT
    const serverEndpoint = params.endpoint || await getServerEndPoint(params.meetingID);
    if (serverEndpoint === null) {
      return Promise.reject(new Error('Endpoint not found'));
    }
    logger.logX('registryHook, serverEndpoint:', serverEndpoint);
    const apiOptions = {
      method: 'GET',
      uri: getUrlForRoomCall('hooks/create', {
        callbackURL: params.callbackURL,
        meetingID: params.meetingID,
        getRaw: params.getRaw,
      }, true, serverEndpoint),
    };
    logger.logX('apiOptions');
    logger.logX(apiOptions);
    const requestResult = await roomRequest(apiOptions);
    logger.logX('requestResult');
    logger.logX(requestResult);
    if (requestResult?.returncode === 'SUCCESS') {
      await setHookInfo(params.internalMeetingID, {
        hookID: requestResult?.hookID,
        endpoint: serverEndpoint,
      });
      return true;
    }
    return Promise.reject(new Error('Create hook error'));
  } catch (error) {
    logger.error(`RoomHook registryHook, error: ${error.toString()}`);
    throw error;
  }
}

/**
 * Destroy hook
 * @param {Number} hookID The ID of the hook that should be removed, as returned in the create hook call
 * @param {String|optional} endpoint Server endpoint
 * @returns {Promise<*>}
 */
export async function destroyHook(hookID, endpoint = null) {
  try {
    const apiOptions = {
      method: 'GET',
      uri: getUrlForRoomCall('hooks/destroy', {
        hookID: hookID,
      }, true, endpoint),
    };
    logger.logX('destroyHook apiOptions');
    logger.logX(apiOptions);
    return await roomRequest(apiOptions);
  } catch (error) {
    logger.error(`RoomHook destroyHook, error: ${error.toString()}`);
    throw error;
  }
}

/**
 * @param internalMeetingId
 * @returns {Promise<boolean>}
 */
export async function destroyHookByMeetingId(internalMeetingId) {
  try {
    const hookInfo = await getHookInfo(internalMeetingId);
    if (hookInfo?.hookID) {
      await destroyHook(hookInfo.hookID, hookInfo.endpoint);
      await deleteHookInfo(internalMeetingId);
    }
    return true;
  } catch (error) {
    logger.error(`RoomHook destroyHookByMeetingId, error: ${error.toString()}`);
    throw error;
  }
}

/**
 * Handle when meeting ended
 * @param meetingId
 * @param internalMeetingId
 * @param timestamp
 * @returns {Promise<boolean>}
 */
async function onMeetingEnded(meetingId, internalMeetingId, timestamp) {
  try {
    const hookInfo = await getHookInfo(internalMeetingId);
    logger.logX('hookInfo:');
    logger.logX(hookInfo);
    const haveRecord = hookInfo?.haveRecord;
    const endpoint = hookInfo?.endpoint;
    await destroyHookByMeetingId(internalMeetingId);
    logger.logX(`meeting-ended: ${haveRecord}, ${endpoint}`);
    // If have record, registry new hook to get the meeting recorded url
    if (haveRecord) {
      await registryHook({
        callbackURL: `${ROOM_HOOK_RECORDED_CALLBACK_URL}?meetingID=${meetingId}&internalMeetingID=${internalMeetingId}`,
        meetingID: meetingId,
        internalMeetingID: internalMeetingId,
        endpoint: endpoint,
      });
    } else {
      await changeUserEventRoomStatus(meetingId, USER_ROOM_STATUS.ENDED);
    }
    const usersOnMeeting = await getUsersOnMeeting(internalMeetingId);
    logger.logX('usersOnMeeting:');
    logger.logX(usersOnMeeting);
    await Promise.all(usersOnMeeting?.map(async (userId) => {
      logger.logX(`onMeetingEnded userId:, ${userId}`);
      await onUserLeft(userId, meetingId, internalMeetingId, timestamp, true);
    }));
    await changeUserEventRoomStatus(meetingId, USER_ROOM_STATUS.ENDED);
    return true;
  } catch (error) {
    logger.error(`RoomHook handleHook onMeetingEnded, meetingId, internalMeetingId:, ${meetingId}, ${internalMeetingId}`);
    logger.error(error.toString());
    throw error;
  }
}

/**
 * Calc userId tracking on internalMeetingId at timestamp
 * @param internalMeetingId
 * @param userId
 * @param timestamp
 */
async function onUserJoined(internalMeetingId, userId, timestamp) {
  try {
    logger.logX('onUserJoined', internalMeetingId, userId, timestamp);
    const trackingInfo = await getUserTrackingInfo(internalMeetingId, userId);
    if (trackingInfo) {
      logger.logX('This user have begin time before, increase views counter!');
      logger.logX(`${internalMeetingId}, ${userId}, ${trackingInfo}`);
      trackingInfo.counter += 1;
      await setUserTrackingInfo(internalMeetingId, userId, trackingInfo);
    } else {
      const info = {
        timeJoined: timestamp,
        counter: 0,
      };
      await setUserTrackingInfo(internalMeetingId, userId, info);
    }
  } catch (error) {
    throw error;
  }
}

/**
 * addUserViewTracking, calc the view time and store to db
 * @param userId
 * @param eventId
 * @param internalMeetingId
 * @param timestamp
 * @param meetingEnded
 * @returns {Promise<boolean>}
 */
async function onUserLeft(userId, eventId, internalMeetingId, timestamp, meetingEnded = false) {
  try {
    logger.logX('onUserLeft', userId, eventId, internalMeetingId, timestamp);
    const trackingInfo = await getUserTrackingInfo(internalMeetingId, userId);
    // If user have no begin tracking, ignore it
    if (!trackingInfo) {
      return false;
    }
    trackingInfo.counter -= 1;
    // If user leave meeting and this user have no joined the meeting on any where else
    if (meetingEnded === true || trackingInfo.counter < 1) {
      const timeJoined = trackingInfo.timeJoined;
      // If total time is -1, this data is invalid
      const duration = parseInt(((timestamp - timeJoined) / 1000).toFixed(0), 10) || -1; // second
      await createUserEventViewTracking({
        event: eventId,
        user: userId,
        internalMeetingId: internalMeetingId,
        timeJoined: timeJoined,
        timeLeft: timestamp,
        duration: duration,
      });
      await deleteUserTrackingInfo(internalMeetingId, userId);
      return true;
    }
    await setUserTrackingInfo(internalMeetingId, userId, trackingInfo);
    return true;
  } catch (error) {
    logger.error(`onUserLeft: ${error.toString()}`);
    logger.error(`userId, eventId, internalMeetingId: ${userId}, ${eventId}, ${internalMeetingId}`);
    throw error;
  }
}

/**
 * Handle hook data return
 * @param data
 * @returns {Promise<*>}
 */
export async function handleHook(data) {
  try {
    logger.logX(`RoomHook handleHook data:${process.env.NODE_APP_INSTANCE ? ` on core ${process.env.NODE_APP_INSTANCE}` : ''}`);
    logger.logX(data);
    if (!data?.event) {
      return false;
    }
    const event = JSON.parse(data.event)[0];
    const eventData = event?.data;
    if (eventData?.type === 'event') {
      const timestamp = Number(data?.timestamp).valueOf();
      const meetingId = eventData?.attributes?.meeting?.['external-meeting-id'];
      const internalMeetingId = eventData?.attributes?.meeting?.['internal-meeting-id'];
      const userId = eventData?.attributes?.user?.['external-user-id'];
      const userRole = eventData?.attributes?.user?.role;
      logger.logX(`RoomHook handleHook, meetingId: ${meetingId}, eventData.id: ${eventData.id}, timestamp: ${timestamp}`);
      switch (eventData.id) {
        case 'user-joined':
          /**
           * {
           *   event: '[{"data":{"type":"event","id":"user-joined","attributes":{"meeting":{"internal-meeting-id":"11976873075a4b96155669970158510920f18847-1587888297169","external-meeting-id":"5a7a73288c8338542f8c33d1"},"user":{"internal-user-id":"w_l3wn7jfaryfh","external-user-id":"5a7a73288c8338542f8c33a4","name":"Nhan","role":"MODERATOR","presenter":false}},"event":{"ts":1587888573620}}}]',
           *   timestamp: '1587888573632',
           *   domain: 'domain.sample'
           * }
           */
          if (userRole === ROOM_VIEWER_ROLES.MODERATOR) {
            await changeUserEventRoomStatus(meetingId, USER_ROOM_STATUS.RUNNING);
          } else {
            await onUserJoined(internalMeetingId, userId, timestamp);
          }
          break;
        case 'user-left':
          /**
           * {
           *   event: '[{"data":{"type":"event","id":"user-left","attributes":{"meeting":{"internal-meeting-id":"11976873075a4b96155669970158510920f18847-1587888297169","external-meeting-id":"5a7a73288c8338542f8c33d1"},"user":{"internal-user-id":"w_cwidmilccu3e","external-user-id":"5a7a73288c8338542f8c33a3"}},"event":{"ts":1587888653531}}}]',
           *   timestamp: '1587888653545',
           *   domain: 'domain.sample'
           * }
           */
          await onUserLeft(userId, meetingId, internalMeetingId, timestamp);
          break;
        case 'meeting-ended':
          /**
           * {
           *   event: '[{"data":{"type":"event","id":"meeting-ended","attributes":{"meeting":{"internal-meeting-id":"11976873075a4b96155669970158510920f18847-1587974887330","external-meeting-id":"5a7a73288c8338542f8c33d1"}},"event":{"ts":1587975121682}}}]',
           *   timestamp: '1587975121684',
           *   domain: 'domain.sample'
           * }
           */
          try {
            await onMeetingEnded(meetingId, internalMeetingId, timestamp);
          } catch (error) {
            logger.error(`RoomHook handleHook onMeetingEnded for meeting-ended, meetingId: ${meetingId}`);
            logger.error(error.toString());
          }
          break;
        case 'meeting-recording-changed':
          const hookInfo = await getHookInfo(internalMeetingId);
          if (hookInfo) {
            hookInfo.haveRecord = true;
            await setHookInfo(internalMeetingId, hookInfo);
          }
          break;
        default:
      }
    }
    return true;
  } catch (error) {
    logger.error(`RoomHook handleHook, error: ${error.toString()}`);
    throw error;
  }
}

/**
 * Handle hook data return
 * @param data
 * @returns {Promise<*>}
 */
export async function handleRecordedHook(data) {
  try {
    logger.logX('RoomHook handleHook data:');
    logger.logX(data);
    if (!data?.event) {
      return false;
    }
    const event = JSON.parse(data.event)[0];
    const eventData = event?.data;
    if (eventData?.type === 'event') {
      const meetingId = eventData?.attributes?.meeting?.['external-meeting-id'];
      const internalMeetingId = eventData?.attributes?.meeting?.['internal-meeting-id'];
      const recordId = eventData?.attributes?.['record-id'];
      const recording = eventData?.attributes?.recording;
      const playback = recording?.playback;
      logger.logX(`RoomHook handleRecordedHook, meetingId: ${meetingId}, eventData.id: ${eventData.id}`);
      if (eventData.id === 'rap-publish-ended') {
        /**
         * {
         *   event: '[{"data":{"type":"event","id":"rap-publish-ended","attributes":{"meeting":{"internal-meeting-id":"edebf30ff70e1c02f8c5f524bc32e0bd19999b1b-1588007281350","external-meeting-id":"5e8f5ff8b34f629aba14bf8e"},"record-id":"edebf30ff70e1c02f8c5f524bc32e0bd19999b1b-1588007281350","success":true,"step-time":415,"workflow":"presentation","recording":{"name":"Test rpc","is-breakout":"false","size":1513869,"metadata":{"bbb-origin-server-name":"domain.sample","bbb-origin-version":"v2","isBreakout":"false","meetingId":"5e8f5ff8b34f629aba14bf8e","meetingName":"Test rpc"},"playback":{"format":"presentation","link":"https://domain.sample/playback/presentation/2.0/playback.html?meetingId=edebf30ff70e1c02f8c5f524bc32e0bd19999b1b-1588007281350","processing_time":54378,"duration":223365,"extensions":{"preview":{"images":{"image":["https://domain.sample/presentation/edebf30ff70e1c02f8c5f524bc32e0bd19999b1b-1588007281350/presentation/d2d9a672040fbde2a47a10bf6c37b6a4b5ae187f-1588007281424/thumbnails/thumb-1.png","https://domain.sample/presentation/edebf30ff70e1c02f8c5f524bc32e0bd19999b1b-1588007281350/presentation/d2d9a672040fbde2a47a10bf6c37b6a4b5ae187f-1588007281424/thumbnails/thumb-2.png","https://domain.sample/presentation/edebf30ff70e1c02f8c5f524bc32e0bd19999b1b-1588007281350/presentation/d2d9a672040fbde2a47a10bf6c37b6a4b5ae187f-1588007281424/thumbnails/thumb-3.png"]}}},"size":1513869},"download":{}}},"event":{"ts":1588007746}}}]',
         *   timestamp: '1588007748910',
         *   domain: 'domain.sample'
         * }
         */
        await addRecordToUserEvent(meetingId, {
          recordId: recordId,
          playback: playback,
        });
        try {
          await destroyHookByMeetingId(internalMeetingId);
        } catch (error) {
          logger.error(`RoomHook handleHook for destroyHookByMeetingId rap-publish-ended, internalMeetingId: ${internalMeetingId}`);
          logger.error(error.toString());
        }
      }
    }
    return true;
  } catch (error) {
    logger.error(`RoomHook handleRecordedHook, error: ${error.toString()}`);
    throw error;
  }
}

/**
 * Handle hook data return
 * @param data
 * @param data.meetingId
 * @param data.internalMeetingId
 * @param {object} data.playback
 * @param {string} data.playback.format
 * @param {string} data.playback.link
 * @param {number} data.playback.processing_time
 * @param {number} data.playback.duration
 * @param {object} data.playback.extensions
 * @param {object} data.playback.extensions.preview
 * @param {object} data.playback.extensions.preview.images
 * @param {Array} data.playback.extensions.preview.images.image
 * @param {number} data.playback.size
 * @returns {Promise<*>}
 */
export async function handleScreenRecordedHook(data) {
  try {
    logger.logX('RoomHook handleScreenRecordedHook data:');
    logger.logX(data);
    const {
      meetingId,
      internalMeetingId,
      playback,
    } = data;
    await addRecordToUserEvent(meetingId, {
      recordId: internalMeetingId,
      playback: playback,
    });
    return true;
  } catch (error) {
    logger.error(`RoomHook handleScreenRecordedHook, error: ${error.toString()}`);
    throw error;
  }
}
