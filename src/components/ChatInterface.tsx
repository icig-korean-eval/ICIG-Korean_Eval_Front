import React, { useState, useRef, useEffect } from 'react';
import { AudioRecorder } from '../services/audioService';
import { transcribeAudio } from '../services/audioService'; 

interface Message {
  type: 'ai' | 'user';
  text: string;
}

interface ChatInterfaceProps {
  messages: Message[];
  currentPage: number;
  onVoiceInput: (text: string) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, currentPage, onVoiceInput }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const recorderRef = useRef<AudioRecorder | null>(null);

  // AI 메시지를 음성으로 읽어주는 함수
  const handlePlayAudio = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = text.match(/[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/) ? 'ko-KR' : 'en-US';
      window.speechSynthesis.speak(utterance);
    } else {
      console.log('이 브라우저에서는 음성 합성을 지원하지 않습니다.');
    }
  };

  // 컴포넌트 마운트 시 녹음기 초기화
  useEffect(() => {
    recorderRef.current = new AudioRecorder();

    // 컴포넌트 언마운트 시 오디오 URL 정리
    return () => {
      if (audioURL) {
        AudioRecorder.revokeAudioURL(audioURL);
      }
    };
  }, [audioURL]);

  // 마이크 버튼 클릭 시 호출되는 함수
  const handleMicClick = async () => {
    if (isRecording) {
      try {
        // 녹음 중이면 녹음 종료
        setIsRecording(false);

        if (recorderRef.current) {
          const audioBlob = await recorderRef.current.stopRecording();
          const url = AudioRecorder.createAudioURL(audioBlob);
          setAudioURL(url);

          // 녹음된 음성 파일을 텍스트로 변환 (API 호출)
          const text = await transcribeAudio(audioBlob);
          onVoiceInput(text);

          // 오디오 URL 정리
          if (audioURL) {
            AudioRecorder.revokeAudioURL(audioURL);
            setAudioURL(null);
          }
        }
      } catch (error) {
        console.error('녹음 종료 중 오류 발생:', error);
        setIsRecording(false);
      }
    } else {
      try {
        // 녹음 시작
        if (recorderRef.current) {
          await recorderRef.current.startRecording();
          setIsRecording(true);
        }
      } catch (error) {
        console.error('녹음 시작 중 오류 발생:', error);
      }
    }
  };

  return (
    <div className="chat-container h-full flex flex-col">
      <div className="messages-container flex-grow overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`chat-bubble ${message.type === 'ai' ? 'ai-bubble' : 'user-bubble'} flex`}
          >
            <div className="flex-grow">{message.text}</div>
            {message.type === 'ai' && (
              <button
                className="play-button ml-2 text-gray-600 hover:text-gray-900"
                onClick={() => handlePlayAudio(message.text)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
              </button>
            )}
          </div>
        ))}
      </div>

      {currentPage >= 2 && (
        <div className="controls-container p-4 flex justify-center">
          <button
            className={`control-button ${isRecording ? 'bg-red-100 animate-pulse' : 'bg-white'}`}
            onClick={handleMicClick}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
              <line x1="12" y1="19" x2="12" y2="23"></line>
              <line x1="8" y1="23" x2="16" y2="23"></line>
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default ChatInterface;
