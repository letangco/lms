import ChatGroup from './chatGroup.model';
import logger from '../../util/logger';
import { getObjectIds, validSearchString } from '../../helpers/string.helper';
import { getGroupLastMessage } from '../chatMessage/chatMessage.service';
import {
  CHAT_GROUP_STATUS,
  CHAT_GROUP_TYPE, COURSE_STATUS,
  DEFAULT_PAGE_LIMIT,
  MAX_PAGE_LIMIT,
  SOCKET_CHAT_EVENT,
} from '../../constants';
import ChatNamespace from '../../socket/chat/chat.namespace';
import APIError from '../../util/APIError';
import { getImageSize } from '../../helpers/resize';
import { getCourseInfoByConditions } from '../course/course.service';
import { resetUserUnreadMessage } from '../user/user.service';

/**
 * Get user group
 * @param userId
 * @param groupId
 * @returns {Promise<void>}
 */
export async function getUserGroup(userId, groupId) {
  try {
    return await ChatGroup.findOne({
      _id: groupId,
      'members._id': userId,
    });
  } catch (error) {
    logger.error('ChatGroupService getUserGroup error:', error);
    throw error;
  }
}

async function getExistedGroup(userIds, type = null) {
  try {
    const chatGroupsFound = await ChatGroup.aggregate([
      {
        $match: {
          'members._id': { $all: userIds },
          course: type ? null : { $ne: null }
        }
      },
      { $addFields: { numUsers: { $size: '$members' } } },
      { $match: { numUsers: { $eq: userIds.length } } },
    ]);
    if (chatGroupsFound.length > 0) {
      return await ChatGroup.populate(chatGroupsFound[0], [
        {
          path: 'members._id',
          select: 'fullName avatar',
        },
      ]);
    }
    return null;
  } catch (error) {
    logger.error('ChatGroupService getExistedGroup error:', error);
    throw error;
  }
}

export async function createGroup(auth, userIds, type) {
  try {
    const authId = auth._id;
    if (userIds.indexOf(authId.toString()) === -1) {
      userIds.push(authId);
    }
    userIds = getObjectIds(userIds);
    // Check the group with users existed?
    let group = await getExistedGroup(userIds, type);
    // If not existed, create new one
    if (!group) {
      group = await ChatGroup.create({
        members: userIds.map(userId => ({
          _id: userId,
          unread: 0,
        })),
        type: CHAT_GROUP_TYPE.USER,
      });
      group = await ChatGroup.populate(group, [
        {
          path: 'members._id',
          select: 'fullName avatar',
        },
      ]);
    }
    return group;
  } catch (error) {
    logger.error('ChatGroupService create group error:', error);
    throw error;
  }
}

/**
 * Get user group info
 * @returns {Promise<void>}
 */
export async function getUserGroupInfo(group, userId) {
  try {
    const membersName = [];
    const membersAvatar = [];
    if (group?.members?.length) {
      group.members = group?.members?.map((member) => {
        if (member?._id?.toString() !== userId?.toString()) {
          membersName.push(member.fullName);
          if (member.avatar) {
            membersAvatar.push(member.avatar);
          }
        }
        return member;
      });
    }
    if (!group?.name) {
      if (group?.course?.name) {
        group.name = group?.course?.name ?? '';
      } else {
        const first3Members = membersName.splice(0, 3);
        let groupName = first3Members.join(',');
        const numUserLeft = membersName.length - 3;
        if (numUserLeft > 0) {
          groupName += ` and ${numUserLeft} others`;
        }
        group.name = groupName;
      }
    }
    group.lastMessage = await getGroupLastMessage(userId, group._id);
    group.membersAvatar = membersAvatar;
    return group;
  } catch (error) {
    logger.error('ChatGroupService getUserGroupInfo error:', error);
    throw error;
  }
}

/**
 * Get user group detail
 * @param userId
 * @param groupId
 * @returns {Promise<void>}
 */
export async function getUserGroupDetail(userId, groupId, resetUnread = true) {
  try {
    let group = await ChatGroup.findOne({
      _id: groupId,
      'members._id': userId,
    }).populate([
      {
        path: 'members._id',
        select: 'fullName avatar online status',
      },
      {
        path: 'course',
        select: 'name thumbnail parent code',
      },
    ]);
    if (group?.members?.length) {
      const members = group.members.map((member) => {
        const memberInfo = member?._id?.toJSON();
        return {
          ...memberInfo,
          unread: member.unread,
        };
      });
      group = group?.toJSON();
      group.members = members;
    }
    if (!group?.course?.thumbnail && group?.course?.parent) {
      const courseParent = await getCourseInfoByConditions({ _id: group.course.parent });
      if (courseParent) {
        group.course.thumbnail = courseParent.thumbnail;
      } else {
        delete group.course.thumbnail;
      }
    }
    if (resetUnread) {
      resetUnreadMessage(userId, groupId);
    }
    return await getUserGroupInfo(group, userId);
  } catch (error) {
    logger.error('ChatGroupService getUserGroupDetail error:', error);
    throw error;
  }
}

export async function getUserGroups(userId, rowPerPage, firstTime, lastTime, textSearch, type) {
  try {
    if (firstTime && lastTime) {
      return Promise.reject(new APIError(422, [{
        msg: 'Please provide only firstTime or only lastTime to get message',
        param: 'firstIdConflictLastId',
        location: 'query',
      }]));
    }
    let pageLimit = Number(rowPerPage || DEFAULT_PAGE_LIMIT).valueOf();
    if (pageLimit > MAX_PAGE_LIMIT) {
      pageLimit = MAX_PAGE_LIMIT;
    }
    const queryConditions = {
      status: CHAT_GROUP_STATUS.ACTIVE,
      'members._id': userId,
    };
    if (type) {
      queryConditions.type = type;
    }
    const sortCondition = {
      updatedAt: -1,
    };
    if (lastTime) {
      queryConditions.updatedAt = { $lt: new Date(lastTime) };
    } else if (firstTime) {
      queryConditions.updatedAt = { $gt: new Date(firstTime) };
      sortCondition.updatedAt = 1;
    }
    let additionalConditions;
    if (typeof textSearch === 'string' && textSearch) {
      additionalConditions = [
        {
          $match: {
            $or: [
              { 'membersInfo.fullName': { $regex: validSearchString(textSearch) } },
              { 'courseInfo.name': { $regex: validSearchString(textSearch) } },
              { 'courseInfo.code': { $regex: validSearchString(textSearch) } },
            ]
          },
        },
      ];
    } else {
      additionalConditions = [];
    }
    const aggregateConditions = [
      {
        $match: queryConditions
      },
      {
        $lookup: {
          from: 'users',
          localField: 'members._id',
          foreignField: '_id',
          as: 'membersInfo',
        }
      },
      {
        $lookup: {
          from: 'courses',
          as: 'courseInfo',
          let: { courseId: '$course' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$_id', '$$courseId'] },
                    // { $eq: ['$status', COURSE_STATUS.ACTIVE] },
                  ]
                }
              }
            },
          ],
        }
      },
      {
        $project: {
          _id: 1,
          members: 1,
          membersInfo: {
            _id: 1,
            fullName: 1,
            avatar: 1,
            online: 1,
            status: 1,
          },
          course: { $ifNull: ['$course', null] },
          courseInfo: { $ifNull: [{ $arrayElemAt: ['$courseInfo', 0] }, { _id: '$course', missingCourse: true }] },
          name: 1,
          updatedAt: 1,
        },
      },
      {
        $match: {
          $expr: {
            $or: [
              { $eq: ['$courseInfo.status', COURSE_STATUS.ACTIVE] },
              { $eq: ['$course', null] },
            ]
          },
        }
      },
      ...additionalConditions,
      {
        $sort: sortCondition,
      },
      {
        $limit: pageLimit,
      },
      {
        $project: {
          _id: 1,
          members: 1,
          membersInfo: {
            _id: 1,
            fullName: 1,
            avatar: 1,
            online: 1,
            status: 1,
          },
          courseInfo: {
            _id: 1,
            name: 1,
            thumbnail: 1,
            code: 1,
            parent: 1,
          },
          name: 1,
          updatedAt: 1,
        },
      },
    ];
    let items = await ChatGroup.aggregate(aggregateConditions);
    if (firstTime) {
      items.reverse();
    }
    items = await Promise.all(
      items.map(async (group, index) => {
        group.members = group?.members ?? [];
        group.membersInfo = group?.membersInfo ?? [];
        group.members = group.membersInfo.map((memberInfo) => {
          memberInfo.unread = group.members.find(member => member._id.toString() === memberInfo._id.toString())?.unread ?? 0;
          if (typeof memberInfo.avatar === 'string') {
            memberInfo.avatar = getImageSize(memberInfo.avatar);
          }
          return memberInfo;
        });
        delete group.membersInfo;
        group.course = group?.courseInfo;
        delete group?.courseInfo;
        if (group?.course?.thumbnail && typeof group?.course?.thumbnail === 'string') {
          group.course.thumbnail = getImageSize(group.course.thumbnail);
        } else if (group?.course?.parent) {
          const courseParent = await getCourseInfoByConditions({ _id: group.course.parent });
          if (courseParent) {
            group.course.thumbnail = courseParent.thumbnail;
          } else {
            delete group.course.thumbnail;
          }
        } else {
          delete group.course.thumbnail;
        }
        const item = await getUserGroupInfo(group, userId);
        item.index = index;
        return item;
      })
    );
    items.sort((a, b) => a.index - b.index);
    return items;
  } catch (error) {
    logger.error('ChatGroupService getUserGroups error:', error);
    throw error;
  }
}

/**
 * Emit message to all group members
 * @param groupId
 * @param message
 * @returns {Promise<boolean>}
 */
export async function emitMessageToGroup(groupId, message) {
  try {
    const group = await ChatGroup.findById(groupId);
    if (group) {
      const groupMembers = group?.members instanceof Array ? group.members : [];
      groupMembers.forEach( (member) => {
        ChatNamespace.emitToRoom(member._id, SOCKET_CHAT_EVENT.MESSAGE, message);
      });
    }
    return true;
  } catch (error) {
    logger.error('ChatGroupService emitMessageToGroup error:', error);
    throw error;
  }
}

export async function resetUnreadMessage(userId, groupId) {
  try {
    await ChatGroup.updateOne({
      _id: groupId,
      'members._id': userId,
    }, {
      $set: {
        'members.$.unread': 0,
      }
    });
    await resetUserUnreadMessage(userId);
    const group = await ChatGroup.findById(groupId);
    if (group) {
      const groupMembers = group?.members instanceof Array ? group.members : [];
      groupMembers.forEach((member) => {
        ChatNamespace.emitToRoom(member._id, SOCKET_CHAT_EVENT.GROUP_UNREAD_MESSAGE_NUM, group);
      });
    }
    return true;
  } catch (error) {
    logger.error('ChatGroupService resetUnreadMessage error:', error);
    throw error;
  }
}

/**
 * Update message group
 * @param userId
 * @param groupId
 * @param data
 * @param data.name
 * @returns {Promise<void>}
 */
export async function updateGroup(userId, groupId, data) {
  try {
    const conditions = {
      _id: groupId,
      'members._id': userId,
    };
    await ChatGroup.updateOne(conditions, {
      $set: {
        name: data.name
      }
    });
    return await ChatGroup.findOne(conditions, 'name');
  } catch (error) {
    logger.error('ChatGroupService updateGroup error:', error);
    throw error;
  }
}

/**
 * Add members to group
 * @param {Object} courseId
 * @param {ObjectId[]} members
 * @returns {Promise<boolean>}
 */
export async function addMembersToGroup(courseId, members) {
  try {
    const conditions = {
      course: courseId,
    };
    const chatGroup = await ChatGroup.findOne(conditions);
    if (chatGroup) {
      await ChatGroup.updateOne(conditions, {
        $push: {
          members: {
            $each: members.map(member => ({
              _id: member,
              unread: 0,
            })),
          },
        },
      });
    } else {
      await ChatGroup.create({
        course: courseId,
        type: CHAT_GROUP_TYPE.COURSE,
        members: members.map(member => ({
          _id: member,
          unread: 0,
        })),
      });
    }
    return true;
  } catch (error) {
    logger.error('ChatGroupService addMembersToGroup error:', error);
    throw error;
  }
}

/**
 * Remove member from group
 * @param {Object} courseId
 * @param {ObjectId} member
 * @returns {Promise<boolean>}
 */
export async function removeMemberFromGroup(courseId, member) {
  try {
    const conditions = {
      course: courseId,
    };
    await ChatGroup.updateOne(conditions, {
      $pull: {
        members: {
          _id: member,
        },
      },
    });
    return true;
  } catch (error) {
    logger.error('ChatGroupService removeMemberFromGroup error:', error);
    throw error;
  }
}

