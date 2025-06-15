import React from 'react';
// @ts-ignore
import { useLearning } from '../../context/LearningContext';
// @ts-ignore
import feedbackBubbleIcon from '../../assets/images/clarity_talk-bubbles-outline-badged.png';

/**
 * 학습 피드백 패널 컴포넌트
 * 사용자의 언어 학습에 대한 자동화된 피드백을 표시합니다.
 */
const FeedbackPanel: React.FC = () => {
  const { 
    feedback, 
    showFeedbackContent, 
    aiHasResponded, 
    currentStage,
    isPlaying,
    handlePlayAudio
  } = useLearning();
  
  return (
    <div className="feedback-panel">
      <div className="feedback-title">📢 Automated feedback system</div>
      
      {/* 피드백 배경 이미지 */}
      <div className="feedback-background-image">
        <img src={feedbackBubbleIcon} alt="피드백 아이콘" width="200" height="200" />
      </div>
      
      {/* 피드백 박스 - AI가 응답하고 피드백이 있을 때 표시 */}
      {(aiHasResponded || currentStage === 'feedback') && showFeedbackContent && feedback && (
        <div className="feedback-box">
          <div className="feedback-content">{feedback}</div>
          
          {/* 피드백 음성 재생 버튼 */}
          <div 
            className={`play-button ${isPlaying === 'feedback' ? 'playing' : ''}`}
            style={{
              position: 'absolute',
              bottom: '20px',
              right: '20px'
            }}
            onClick={() => handlePlayAudio(feedback, 'feedback')}
          >
            {isPlaying === 'feedback' ? '⏸' : '▶'}
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedbackPanel;
