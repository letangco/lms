import socketIOAuth from 'socketio-auth';
import NamespaceInterface from '../interface/namespace.interface';
import logger from '../../util/logger';
import { SOCKET_ERROR, GROUP_CHAT_SOCKET_NAMESPACE, REDIS_KEYS } from '../../constants';
import { isAuthorized } from '../socket.auth';
import { isObjectId } from '../../helpers/string.helper';
import Redis from '../../util/Redis';

export default class ChatGroupNamespace extends NamespaceInterface {
  static instance = null;

  static getInstance() {
    return ChatGroupNamespace.instance;
  }

  constructor(io) {
    super(io);
    this.initial(GROUP_CHAT_SOCKET_NAMESPACE);
    ChatGroupNamespace.instance = this;
  }

  run() {
    this.listenSocket();
  }

  listenSocket() {
    socketIOAuth(this.nsp, {
      authenticate: this.authenticate.bind(this),
      disconnect: this.onDisconnect.bind(this),
      timeout: 'none',
    });
  }

  async authenticate(socket, data, callback) {
    const token = data?.token;
    const group = data?.group;
    // Get credentials sent by the client
    if (token && isObjectId(group)) {
      try {
        const userData = await isAuthorized(token);
        if (userData?.id) {
          socket.client.userId = userData.id.toString();
          socket.client.group = group;
          let groupUsers = await Redis.getHm(`${REDIS_KEYS.TRACKING_GROUP_JOINED}-${group}`);
          if (groupUsers?.length) {
            if (groupUsers.indexOf(userData?.id?.toString()) === -1) {
              groupUsers.push(userData?.id?.toString());
            }
          } else {
            groupUsers = [userData?.id?.toString()];
          }
          await Redis.del(`${REDIS_KEYS.TRACKING_GROUP_JOINED}-${group}`);
          await Redis.setHm(`${REDIS_KEYS.TRACKING_GROUP_JOINED}-${group}`, groupUsers);
          return callback(null, true);
        }
      } catch (error) {
        logger.error('User socket authentication error:', error);
        return callback(new Error(SOCKET_ERROR.UNAUTHORIZED));
      }
    }
    return callback(new Error(SOCKET_ERROR.UNAUTHORIZED));
  }

  async handleSocketDisconnect(socket) {
    await this.connectionClose(socket);
  }

  async handleSocketError(socket) {
    await this.connectionClose(socket);
  }

  async onDisconnect(socket) {
    await this.connectionClose(socket);
  }

  async connectionClose(socket) {
    const group = socket.client.group;
    const userId = socket.client?.userId?.toString();
    socket.leave(group, async () => {
      let groupUsers = await Redis.getHm(`${REDIS_KEYS.TRACKING_GROUP_JOINED}-${group}`);
      if (groupUsers?.length) {
        if (groupUsers.indexOf(userId) !== -1) {
          groupUsers.splice(groupUsers.indexOf(userId), 1);
        }
      }
      await Redis.del(`${REDIS_KEYS.TRACKING_GROUP_JOINED}-${group}`);
      if (groupUsers?.length) {
        await Redis.setHm(`${REDIS_KEYS.TRACKING_GROUP_JOINED}-${group}`, groupUsers);
      }
    });
    socket.off('disconnect', this.handleSocketDisconnect);
    socket.off('error', this.handleSocketError);
  }

  /**
   * Broadcast data to namespace
   * @param event
   * @param data
   */
  static broadcastToNamespace(event, data) {
    const groupChatNamespace = ChatGroupNamespace.getInstance();
    if (groupChatNamespace) {
      groupChatNamespace.broadcastToNamespace(event, data);
    }
  }
}
