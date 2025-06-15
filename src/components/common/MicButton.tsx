import React from 'react';
// @ts-ignore
import { useLearning } from '../../context/LearningContext';
// @ts-ignore
import microphoneIcon from '../../assets/icons/mdi-light_microphone.svg';

/**
 * 마이크 버튼 컴포넌트
 * 녹음 시작/중지 기능을 제공합니다
 */
const MicButton: React.FC = () => {
  const { isRecording, toggleRecording } = useLearning();
  
  return (
    <div 
      className={`mic-button ${isRecording ? 'recording' : ''}`}
      onClick={toggleRecording}
    >
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        width: '100%', 
        height: '100%' 
      }}>
        <img src={microphoneIcon} alt="마이크" width="30" height="30" />
      </div>
    </div>
  );
};

export default MicButton;
