import React from 'react';
import { Message } from '../../types/index';
import { useLearning } from '../../context/LearningContext';

// 이미지 임포트
// @ts-ignore
import aiChatIcon from '../../assets/images/alstj1.png';
// @ts-ignore
import userChatIcon from '../../assets/images/Vector.png';

interface MessageBubbleProps {
  message: Message;
}

/**
 * 채팅 메시지 버블 컴포넌트
 * AI와 사용자 메시지를 다르게 표시
 */
const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const { isPlaying, handlePlayAudio } = useLearning();
  const { type, text, id } = message;
  
  return (
    <div className={`${type}-message-bubble`}>
      {/* AI 메시지인 경우에만 아바타와 재생 버튼 표시 */}
      {type === 'ai' && (
        <>
          <div className="ai-avatar">
            <img src={aiChatIcon} alt="AI 튜터" width="65" height="65" />
          </div>
          <div 
            className={`play-button ${isPlaying === id ? 'playing' : ''}`}
            onClick={() => handlePlayAudio(text, id)}
          >
            {isPlaying === id ? '⏸' : '▶'}
          </div>
        </>
      )}
      
      {/* 사용자 메시지인 경우 사용자 아이콘 표시 */}
      {type === 'user' && (
        <div className="user-avatar">
          <img src={userChatIcon} alt="사용자" width="40" height="40" />
        </div>
      )}
      
      <div className="message-text">{text}</div>
    </div>
  );
};

export default MessageBubble;
