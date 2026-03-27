export interface MessageThread {
  id: string;
  participants: string[];
  subject: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: Record<string, number>;
  createdAt: string;
}

export interface Message {
  id: string;
  threadId: string;
  senderId: string;
  senderName: string;
  content: string;
  attachments?: string[];
  isRead: boolean;
  createdAt: string;
}

export interface Conversation {
  thread: MessageThread;
  messages: Message[];
}

const mockThreads: MessageThread[] = [
  {
    id: 'thread_001',
    participants: ['b1', 'b2'],
    subject: 'Olive Oil Supply Inquiry',
    lastMessage: 'We can offer 50MT at the quoted price.',
    lastMessageAt: '2026-02-28T14:30:00Z',
    unreadCount: { b1: 0, b2: 1 },
    createdAt: '2026-02-20T10:00:00Z',
  },
  {
    id: 'thread_002',
    participants: ['b5', 'b9'],
    subject: 'Leather Goods Partnership',
    lastMessage: 'Please find attached the product catalog.',
    lastMessageAt: '2026-02-27T09:15:00Z',
    unreadCount: { b5: 0, b2: 2 },
    createdAt: '2026-02-15T08:00:00Z',
  },
  {
    id: 'thread_003',
    participants: ['b8', 'b6'],
    subject: 'Medical Equipment Inquiry',
    lastMessage: 'We need more details on the specifications.',
    lastMessageAt: '2026-02-26T16:45:00Z',
    unreadCount: { b8: 1, b6: 0 },
    createdAt: '2026-02-10T11:00:00Z',
  },
];

const mockMessages: Record<string, Message[]> = {
  'thread_001': [
    { id: 'msg_001', threadId: 'thread_001', senderId: 'b1', senderName: 'Lagos Agro Exports', content: 'Hello, we are interested in importing premium olive oil from Italy. Can you provide a quote for 50MT monthly?', isRead: true, createdAt: '2026-02-20T10:00:00Z' },
    { id: 'msg_002', threadId: 'thread_001', senderId: 'b2', senderName: 'Napoli Trade Solutions', content: 'Thank you for your interest. We can offer our premium EVOO at $1,000/MT. This includes packaging and documentation.', isRead: true, createdAt: '2026-02-20T14:30:00Z' },
    { id: 'msg_003', threadId: 'thread_001', senderId: 'b1', senderName: 'Lagos Agro Exports', content: 'That price seems high. Can you offer a discount for bulk orders?', isRead: true, createdAt: '2026-02-21T09:00:00Z' },
    { id: 'msg_004', threadId: 'thread_001', senderId: 'b2', senderName: 'Napoli Trade Solutions', content: 'We can offer 5% discount for orders above 40MT. Payment via escrow required.', isRead: false, createdAt: '2026-02-28T14:30:00Z' },
  ],
  'thread_002': [
    { id: 'msg_005', threadId: 'thread_002', senderId: 'b5', senderName: 'Milano Fashion House', content: 'We are looking for a supplier of high-quality leather goods.', isRead: true, createdAt: '2026-02-15T08:00:00Z' },
    { id: 'msg_006', threadId: 'thread_002', senderId: 'b9', senderName: 'Kano Leather Works', content: 'We specialize in premium leather bags and accessories. Let me send you our catalog.', isRead: false, createdAt: '2026-02-27T09:15:00Z' },
  ],
};

export const messagingService = {
  getThreads(userId: string): MessageThread[] {
    return mockThreads.filter(t => t.participants.includes(userId));
  },

  getThread(threadId: string): MessageThread | undefined {
    return mockThreads.find(t => t.id === threadId);
  },

  getMessages(threadId: string): Message[] {
    return mockMessages[threadId] || [];
  },

  getConversation(threadId: string): Conversation | null {
    const thread = this.getThread(threadId);
    if (!thread) return null;
    return {
      thread,
      messages: this.getMessages(threadId),
    };
  },

  sendMessage(threadId: string, senderId: string, senderName: string, content: string): Message {
    const newMessage: Message = {
      id: `msg_${Date.now()}`,
      threadId,
      senderId,
      senderName,
      content,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    
    if (!mockMessages[threadId]) {
      mockMessages[threadId] = [];
    }
    mockMessages[threadId].push(newMessage);
    
    return newMessage;
  },

  markAsRead(threadId: string, userId: string) {
    const thread = mockThreads.find(t => t.id === threadId);
    if (thread) {
      thread.unreadCount[userId] = 0;
    }
    const messages = mockMessages[threadId];
    if (messages) {
      messages.forEach(m => {
        if (m.senderId !== userId) {
          m.isRead = true;
        }
      });
    }
  },

  getTotalUnread(userId: string): number {
    return mockThreads
      .filter(t => t.participants.includes(userId))
      .reduce((sum, t) => sum + (t.unreadCount[userId] || 0), 0);
  },
};
