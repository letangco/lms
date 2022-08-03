/**
 * Entry point for socket
 *
 */
import SocketIO from 'socket.io';
import ChatNamespace from './chat/chat.namespace';
import GroupChatNamespace from './chat/chatGroup.namespace';
import DiscussionNamespace from './discussion/discussion.namespace';
import logger from '../util/logger';

export default class Socket {
  static chatNamespace;

  static discussionNamespace;

  constructor(httpServer) {
    this.io = new SocketIO(httpServer);
  }

  run() {
    const chatNamespace = new ChatNamespace(this.io);
    chatNamespace.run();
    Socket.chatNamespace = chatNamespace;
    const groupChatNamespace = new GroupChatNamespace(this.io);
    groupChatNamespace.run();
    Socket.groupChatNamespace = groupChatNamespace;
    const discussionNamespace = new DiscussionNamespace(this.io);
    discussionNamespace.run();
    Socket.discussionNamespace = discussionNamespace;
    logger.info('Sockets is running...');
  }
}

