import logger from '../../util/logger';

export default class RoomInterface {
  constructor(nsp, roomId) {
    this.nsp = nsp;
    this.roomId = roomId;
  }

  /**
   * Send message to socket owner
   * @param socket
   * @param event
   * @param data
   */
  sendMessageToSocket(socket, event, data) {
    const roomId = this.roomId;
    // Check socket is in roomId
    if (roomId && socket.rooms[roomId]) {
      // Only send When socket is in room
      socket.emit(event, data);
    } else {
      logger.logX('Socket is not in room', roomId);
    }
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
   * Send message to room
   * @param roomId
   * @param event
   * @param data
   */
  sendMessageToRoom(roomId, event, data) {
    this.nsp.to(roomId).emit(event, data);
  }

  /**
   * Return num clients on current room
   * @returns {Promise<number>}
   */
  countClientsOnRoom() {
    return new Promise((resolve) => {
      this.nsp.in(this.roomId).clients((err, clients) => {
        if (err) {
          logger.logX('err:', err);
          return resolve(0);
        }
        let numClients = clients.length - 1;
        numClients = numClients < 0 ? 0 : numClients; // Minimum num client is 0
        return resolve(numClients);
      });
    });
  }
}
