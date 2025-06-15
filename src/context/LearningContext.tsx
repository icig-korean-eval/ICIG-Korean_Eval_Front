// src/context/LearningContext.tsx
import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { Message, LearningStage, LearningContextType } from '../types/index';
import { AudioRecorder, transcribeAudio } from '../services/audioService';

const LearningContext = createContext<LearningContextType | undefined>(undefined);

const generateId = () => Math.random().toString(36).substring(2, 15);

export const LearningProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      type: 'ai',
      text: 'Hello, ICIG! Tell me the situation you want to learn. For example, ordering at a café!',
      id: 'initial-message'
    }
  ]);
  const [currentStage, setCurrentStage] = useState<LearningStage>('initial');
  const [feedback, setFeedback] = useState<string>('');
  const [showFeedbackContent, setShowFeedbackContent] = useState(false);
  const [aiHasResponded, setAiHasResponded] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<string | null>(null);
  const [chatId, setChatId] = useState<string | null>(null);

  const recorderRef = useRef<AudioRecorder | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    recorderRef.current = new AudioRecorder();
    return () => {
      if (audioURL) AudioRecorder.revokeAudioURL(audioURL);
    };
  }, [audioURL]);

  const addMessage = (message: Omit<Message, 'id'>) => {
    const newMessage = { ...message, id: generateId() };
    setMessages(prev => [...prev, newMessage]);
  };

  const updateFeedback = (newFeedback: string) => {
    setFeedback(newFeedback);
    setShowFeedbackContent(true);
    setCurrentStage('feedback');
    setAiHasResponded(true);
  };

  const formatFeedback = (feedbackData: any) => {
    let result = '';
    if (feedbackData?.grammatical_errors?.length > 0) {
      result += '🛠 Grammar:\n';
      feedbackData.grammatical_errors.forEach((e: any) => {
        result += `- ❌ ${e["Incorrect part"]} → ✅ ${e["Corrected version"]} (${e["Reason"]})\n`;
      });
    }
    if (feedbackData?.better_expressions?.length > 0) {
      result += '\n💡 Better expressions:\n';
      feedbackData.better_expressions.forEach((e: any) => {
        result += `- ✏️ ${e["Original part"]} → 💬 ${e["Suggestion"]} (${e["Reason"]})\n`;
      });
    }
    return result || '✅ Good job!';
  };

  const createChat = async (situation: string) => {
    const res = await fetch('http://175.212.190.95:8010/api/v1/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ situation })
    });
    const data = await res.json();
    setChatId(data.chat_id);
    addMessage({ type: 'ai', text: `Great! Let’s begin practicing: "${situation}".` });
  };

  const getIPA = async (text: string) => {
    const res = await fetch('http://175.212.190.95:8010/api/v1/ipa/text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });
    const data = await res.json();
    return data.result_array.join(' ');
  };

  const sendUserMessage = async (message: string) => {
    if (!chatId) return;
    addMessage({ type: 'user', text: message });
    setCurrentStage('userInput');
    const res = await fetch('http://175.212.190.95:8010/api/v1/chat/conversation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, message })
    });
    const data = await res.json();
    addMessage({ type: 'ai', text: data.reply });
    const ipaText = await getIPA(message);
    updateFeedback(formatFeedback(data.feedback) + `\n\n🗣 IPA: ${ipaText}`);
  };

  const toggleRecording = async () => {
    if (isRecording) {
      setIsRecording(false);
      if (recorderRef.current) {
        const audioBlob = await recorderRef.current.stopRecording();
        const url = AudioRecorder.createAudioURL(audioBlob);
        setAudioURL(url);
        const userInput = await transcribeAudio(audioBlob);
        await sendUserMessage(userInput);
      }
    } else {
      if (recorderRef.current) {
        await recorderRef.current.startRecording();
        setIsRecording(true);
      }
    }
  };

  const handlePlayAudio = (text: string, id: string) => {
    if ('speechSynthesis' in window) {
      if (isPlaying === id) {
        window.speechSynthesis.cancel();
        setIsPlaying(null);
        return;
      }
      if (isPlaying) window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = /[ㄱ-ㅎ|가-힣]/.test(text) ? 'ko-KR' : 'en-US';
      utteranceRef.current = utterance;
      setIsPlaying(id);
      utterance.onend = () => {
        setIsPlaying(null);
        utteranceRef.current = null;
      };
      window.speechSynthesis.speak(utterance);
    }
  };

  const contextValue: LearningContextType = {
    messages,
    currentStage,
    feedback,
    isRecording,
    audioURL,
    isPlaying,
    showFeedbackContent,
    aiHasResponded,
    addMessage,
    setCurrentStage,
    setFeedback,
    toggleRecording,
    handlePlayAudio,
    setShowFeedbackContent,
    setAiHasResponded,
    createChat
  };

  return (
    <LearningContext.Provider value={contextValue}>
      {children}
    </LearningContext.Provider>
  );
};

export const useLearning = () => {
  const context = useContext(LearningContext);
  if (context === undefined) {
    throw new Error('useLearning must be used within a LearningProvider');
  }
  return context;
};