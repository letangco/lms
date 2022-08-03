import socketIOAuth from 'socketio-auth';
import NamespaceInterface from '../interface/namespace.interface';
import logger from '../../util/logger';
import { SOCKET_ERROR, DISCUSSION_SOCKET_NAMESPACE } from '../../constants';
import { isAuthorized } from '../socket.auth';
import { isObjectId } from '../../helpers/string.helper';

export default class DiscussionNamespace extends NamespaceInterface {
  static instance = null;

  static getInstance() {
    return DiscussionNamespace.instance;
  }

  constructor(io) {
    super(io);
    this.initial(DISCUSSION_SOCKET_NAMESPACE);
    DiscussionNamespace.instance = this;
  }

  run() {
    this.listenSocket();
  }

  listenSocket() {
    socketIOAuth(this.nsp, {
      authenticate: this.authenticate.bind(this),
      postAuthenticate: this.onPostAuthenticate.bind(this),
      disconnect: this.onDisconnect.bind(this),
      timeout: 'none',
    });
  }

  async authenticate(socket, data, callback) {
    const token = data?.token;
    const discussion = data?.discussion;
    // Get credentials sent by the client
    if (token && isObjectId(discussion)) {
      try {
        const userData = await isAuthorized(token);
        if (userData?.id) {
          socket.client.userId = userData.id;
          socket.client.discussion = discussion;
          return callback(null, true);
        }
      } catch (error) {
        logger.error('User socket authentication error:', error);
        return callback(new Error(SOCKET_ERROR.UNAUTHORIZED));
      }
    }
    return callback(new Error(SOCKET_ERROR.UNAUTHORIZED));
  }

  /**
   * Auth passed
   * @param socket
   */
  async onPostAuthenticate(socket) {
    const discussion = socket.client.discussion;
    socket.join(discussion);
    socket.on('disconnect', this.handleSocketDisconnect.bind(this, socket));
    socket.on('error', this.handleSocketError.bind(this, socket));
  }

  async handleSocketDisconnect(socket, reason) {
    await this.connectionClose(socket);
  }

  async handleSocketError(socket, error) {
    await this.connectionClose(socket);
  }

  async onDisconnect(socket) {
    await this.connectionClose(socket);
  }

  async connectionClose(socket) {
    const discussion = socket.client.discussion;
    socket.leave(discussion, async () => {
      logger.logX('Leave room:', discussion, 'success');
    });
    socket.off('disconnect', this.handleSocketDisconnect);
    socket.off('error', this.handleSocketError);
  }

  /**
   * Emit data to all sockets of room
   * @param roomId
   * @param event
   * @param data
   */
  static emitToRoom(roomId, event, data) {
    const discussionNamespace = DiscussionNamespace.getInstance();
    if (discussionNamespace) {
      discussionNamespace.sendMessageToRoom(roomId, event, data);
    }
  }

  /**
   * Broadcast data to namespace
   * @param event
   * @param data
   */
  static broadcastToNamespace(event, data) {
    const discussionNamespace = DiscussionNamespace.getInstance();
    if (discussionNamespace) {
      discussionNamespace.broadcastToNamespace(event, data);
    }
  }
}
