import React from 'react';
import MessageBubble from './MessageBubble';
import { useLearning } from '../../context/LearningContext';
import { Message } from '../../types/index';

/**
 * 전체 채팅 컨테이너 컴포넌트
 * 모든 메시지 버블을 표시합니다
 */
const ChatContainer: React.FC = () => {
  const { messages } = useLearning();
  
  return (
    <div className="chat-container">
      {messages.map((message: Message) => (
        <MessageBubble key={message.id} message={message} />
      ))}
    </div>
  );
};

export default ChatContainer;
