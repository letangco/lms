import ChatMessage from './chatMessage.model';
import ChatGroup from '../chatGroup/chatGroup.model';
import * as ChatGroupService from '../chatGroup/chatGroup.service';
import {
  CHAT_MESSAGE_STATUS,
  CHAT_MESSAGE_TYPE,
  DEFAULT_PAGE_LIMIT,
  MAX_PAGE_LIMIT, REDIS_KEYS,
  SOCKET_CHAT_EVENT,
} from '../../constants';
import logger from '../../util/logger';
import APIError from '../../util/APIError';
import ChatNamespace from '../../socket/chat/chat.namespace';
import { increaseUserUnreadMessage } from '../user/user.service';
import Redis from '../../util/Redis';
import { getUserGroupDetail } from '../chatGroup/chatGroup.service';

/**
 * Update the message that user unread from each group and total group
 * @param sender User create the message
 * @param group Group model instance
 * @returns {Promise<void>}
 */
async function increaseUnread(group) {
  try {
    const groupUsers = await Redis.getHm(`${REDIS_KEYS.TRACKING_GROUP_JOINED}-${group._id}`);
    await ChatGroup.updateOne(
    {
      _id: group._id
    },
    {
      $inc: {
        'members.$[member].unread': 1
      }
    },
    {
      arrayFilters: [
        { 'member._id': { $nin: groupUsers } }
      ],
      multi: true,
    }
    );
    group = await ChatGroup.findOne({
      _id: group._id
    });
    if (group?.members instanceof Array) {
      group.members.map(async (member) => {
        if (groupUsers.indexOf(member._id.toString()) === -1) {
          await increaseUserUnreadMessage(member._id);
        }
        const chatGroup = await getUserGroupDetail(member._id, group._id, false);
        ChatNamespace.emitToRoom(member._id, SOCKET_CHAT_EVENT.GROUP_CHAT_UPDATE, chatGroup);
      });
    }
  } catch (error) {
    logger.error('ChatMessageService increaseUnread error:', error);
    throw new APIError(500, 'Internal server error');
  }
}

/**
 * Create new message
 * @param message
 * @param {objectId} message.sender
 * @param {objectId} message.group
 * @param {object} message.content
 * @param {string|option} message.type
 * @returns {Promise<void>}
 */
export async function addMessage(message) {
  try {
    // Check the user group existed
    const userGroup = await ChatGroupService.getUserGroup(message.sender, message.group);
    if (!userGroup) {
      return Promise.reject(new APIError(404, 'User group not found'));
    }
    const messageInfo = {
      sender: message.sender,
      group: message.group,
      content: message.content,
      type: message.type,
    };
    const newMessage = await ChatMessage.create(messageInfo);
    await increaseUnread(userGroup);
    return newMessage;
  } catch (error) {
    logger.error('ChatMessageService addMessage error:', error);
    throw new APIError(500, 'Internal server error');
  }
}

export async function getUserGroupMessages(authId, groupId, rowPerPage, firstId, lastId) {
  try {
    if (firstId && lastId) {
      return Promise.reject(new APIError(422, [{
        msg: 'Please provide only firstId or only lastId to get message',
        param: 'firstIdConflictLastId',
        location: 'query',
      }]));
    }
    let pageLimit = Number(rowPerPage || DEFAULT_PAGE_LIMIT).valueOf();
    if (pageLimit > MAX_PAGE_LIMIT) {
      pageLimit = MAX_PAGE_LIMIT;
    }
    const queryConditions = {
      group: groupId,
    };
    const sortCondition = {
      _id: -1,
    };
    if (lastId) {
      queryConditions._id = { $lt: lastId };
    } else if (firstId) {
      queryConditions._id = { $gt: firstId };
      sortCondition._id = 1;
    }
    const messages = await ChatMessage.find(queryConditions)
    .sort(sortCondition).limit(pageLimit).populate([
      {
        path: 'sender',
        select: 'fullName avatar online',
      },
    ]);
    if (firstId) {
      return messages.reverse();
    }
    return messages;
  } catch (error) {
    logger.error('ChatMessageService getUserGroupMessages error:', error);
    throw error;
  }
}

/**
 * getGroupLastMessage
 * @param {ObjectId} userId
 * @param {ObjectId} groupId
 * @returns {Promise<void|any>}
 */
export async function getGroupLastMessage(userId, groupId) {
  try {
    const queryConditions = {
      group: groupId,
      status: CHAT_MESSAGE_STATUS.ACTIVE,
    };
    const sortCondition = {
      _id: -1,
    };
    const messages = await ChatMessage.find(queryConditions)
      .sort(sortCondition).limit(1).populate([
        {
          path: 'sender',
          select: '_id fullName avatar',
        },
      ]);
    let message = messages.pop();
    if (message) {
      message = message.toJSON();
      let messageBody = '';
      switch (message?.type) {
        case CHAT_MESSAGE_TYPE.MESSAGE:
          if (message.content.text) {
            messageBody = message.content.text;
          } else if (message.content.files?.length > 0) {
            messageBody = `Send files ${message.content.files[0]?.filename}`;
          }
          break;
        default:
      }
      if (message.sender._id.toString() === userId.toString()) {
        messageBody = `You: ${messageBody}`;
      } else {
        messageBody = `${message.sender.fullName}: ${messageBody}`;
      }
      message.body = messageBody;
    }
    return message;
  } catch (error) {
    logger.error('ChatMessageService getGroupLastMessage error:', error);
    throw error;
  }
}

/**
 * emitMessageToUser
 * @param {ObjectId} userId
 * @param message
 * @returns boolean
 */
export function emitMessageToUser(userId, message) {
  try {
    if (userId) {
      ChatNamespace.emitToRoom(userId, SOCKET_CHAT_EVENT.MESSAGE, message);
    }
    return true;
  } catch (error) {
    logger.error('ChatMessageService emitMessageToUser error:', error);
    throw error;
  }
}
