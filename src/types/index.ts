// Message types
export type MessageType = 'ai' | 'user';

export interface Message {
  type: MessageType;
  text: string;
  id: string;
}

// Learning process stages
export type LearningStage = 'initial' | 'userInput' | 'aiResponse' | 'feedback';

// Audio recorder types
export interface AudioRecorderInstance {
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<Blob>;
}

// Context types
export interface LearningContextType {
  messages: Message[];
  currentStage: LearningStage;
  feedback: string;
  isRecording: boolean;
  audioURL: string | null;
  isPlaying: string | null;
  showFeedbackContent: boolean;
  aiHasResponded: boolean;
  
  // Methods
  addMessage: (message: Omit<Message, 'id'>) => void;
  setCurrentStage: (stage: LearningStage) => void;
  setFeedback: (feedback: string) => void;
  toggleRecording: () => Promise<void>;
  handlePlayAudio: (text: string, id: string) => void;
  setShowFeedbackContent: (show: boolean) => void;
  setAiHasResponded: (responded: boolean) => void;
  createChat: (situation: string) => Promise<void>;
}
