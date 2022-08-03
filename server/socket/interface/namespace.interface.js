import logger from '../../util/logger';

export default class NamespaceInterface {
  constructor(io) {
    this.io = io;
    this.rooms = {};
  }

  initial(namespace) {
    const io = this.io;
    this.nsp = io.of(namespace);
  }

  /**
   * Send message to identity room
   * @param roomId
   * @param event
   * @param data
   */
  sendMessageToRoom(roomId, event, data) {
    // logger.logX('sendMessageToRoom', roomId, event, data);
    this.nsp.to(roomId).emit(event, data);
  }

  /**
   * Broadcast to namespace
   * @param event
   * @param data
   */
  broadcastToNamespace(event, data) {
    // logger.logX('broadcastToNamespace', event, data);
    this.nsp.emit(event, data);
  }

  /**
   * Send message to room exclude sender
   * @param socket
   * @param roomId
   * @param event
   * @param data
   */
  sendMessageToRoomExcludeSender(socket, roomId, event, data) {
    socket.to(roomId).emit(event, data);
  }

  /**
   * Send message to identity user
   * @param socketId
   * @param event
   * @param data
   */
  sendMessageToSocketId(socketId, event, data) {
    this.nsp.to(socketId).emit(event, data);
  }

  destroyRoom(roomId) {
    const room = this.rooms[roomId];
    if (room) {
      room.destroy();
      // Remove stream room from list
      delete this.rooms[roomId];
      return true;
    }
    logger.logX('Room is not existed:', roomId);
    return false;
  }

  getSocketById(socketId) {
    return this.nsp.connected[socketId];
  }

  getConcurrentCurrentUsers(roomId) {
    return new Promise((resolve) => {
      try {
        this.nsp.in(roomId).clients((err, clients) => {
          if (err) {
            return resolve(0);
          }
          let numViewer = clients.length - 1;
          numViewer = numViewer < 0 ? 0 : numViewer; // Minimum num viewer is 0
          return resolve(numViewer);
        });
      } catch (error) {
        logger.error('getConcurrentCurrentUsers error:');
        logger.error(error);
        return resolve(0);
      }
      return resolve(0);
    });
  }
}
