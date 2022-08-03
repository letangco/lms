import socketIOAuth from 'socketio-auth';
import NamespaceInterface from '../interface/namespace.interface';
import logger from '../../util/logger';
import { SOCKET_ERROR, CHAT_SOCKET_NAMESPACE } from '../../constants';
import { isAuthorized } from '../socket.auth';
import { setUserOnline, setUserOffline } from '../../components/user/user.service';
var users = [], users_connected = [];
export default class ChatNamespace extends NamespaceInterface {
  static instance = null;

  static getInstance() {
    return ChatNamespace.instance;
  }

  constructor(io) {
    super(io);
    this.initial(CHAT_SOCKET_NAMESPACE);
    ChatNamespace.instance = this;
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
    // Get credentials sent by the client
    if (token) {
      try {
        const userData = await isAuthorized(token);
        if (userData?.id) {
          socket.client.userId = userData.id;
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
    const userId = socket.client.userId;
    if (users_connected.indexOf(userId) < 0) {
      users_connected.push(userId);
    }
    if (users.indexOf(userId) < 0) {
      users.push(userId);
    }
    socket.join(userId);
    await setUserOnline(userId);
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
    const userId = socket.client.userId;
    users_connected.splice(users_connected.indexOf(userId), 1);
    const _this = this;
    setTimeout(function () {
      if (users_connected.indexOf(userId) < 0) {
        socket.leave(userId, async () => {
          if (!await _this.getConcurrentCurrentUsers(userId)) {
            await setUserOffline(userId);
          }
        });
        socket.off('disconnect', _this.handleSocketDisconnect);
        socket.off('error', _this.handleSocketError);
        users.splice(users.indexOf(userId), 1);
      }
    }, 3000);
  }

  /**
   * Emit data to all sockets of room
   * @param roomId
   * @param event
   * @param data
   */
  static emitToRoom(roomId, event, data) {
    const chatNamespace = ChatNamespace.getInstance();
    if (chatNamespace) {
      chatNamespace.sendMessageToRoom(roomId, event, data);
    }
  }

  /**
   * Broadcast data to namespace
   * @param event
   * @param data
   */
  static broadcastToNamespace(event, data) {
    const chatNamespace = ChatNamespace.getInstance();
    if (chatNamespace) {
      chatNamespace.broadcastToNamespace(event, data);
    }
  }
}
