import React from 'react';

interface FeedbackSystemProps {
  feedback: string | null;
  visible: boolean;
}

const FeedbackSystem: React.FC<FeedbackSystemProps> = ({ feedback, visible }) => {
  // Function to handle text-to-speech for feedback
  const handlePlayFeedback = () => {
    if (!feedback) return;
    
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(feedback);
      utterance.lang = feedback.match(/[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/) ? 'ko-KR' : 'en-US';
      window.speechSynthesis.speak(utterance);
    } else {
      console.log('Text-to-speech not supported in this browser');
    }
  };
  
  if (!visible) return null;
  
  return (
    <div className="feedback-container h-full p-6">
      <div className="feedback-header flex justify-between items-center mb-6">
        <h2
          className="feedback-title"
          style={{
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            fontSize: '0.875rem',    // text-sm
            marginRight: '1rem'       // mr-4
          }}
        >
          📢 Automated feedback system
        </h2>
        {feedback && (
          <button 
            className="play-button text-gray-600 hover:text-gray-900"
            onClick={handlePlayFeedback}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
          </button>
        )}
      </div>
      
      <div className="feedback-content">
        {feedback ? (
          <div className="whitespace-pre-line">{feedback}</div>
        ) : (
          <div className="text-gray-500 italic">
            No feedback available yet. Once you practice speaking, you'll receive automated feedback here.
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedbackSystem;
