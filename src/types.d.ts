// Type declarations for project-specific modules

// ChatInterface component props
interface ChatInterfaceProps {
  messages: Message[];
  currentPage: number;
  onVoiceInput: (text: string) => void;
}

// FeedbackSystem component props
interface FeedbackSystemProps {
  feedback: string | null;
  visible: boolean;
}

// Message type for chat conversations
type MessageType = 'ai' | 'user';

interface Message {
  type: MessageType;
  text: string;
}

// Audio recording state
interface RecordingState {
  isRecording: boolean;
  audioURL: string | null;
}

// Declare modules for components to resolve TypeScript errors
declare module '*.tsx' {
  const component: any;
  export default component;
}

// Declare modules for image files
declare module '*.png' {
  const src: string;
  export default src;
}

declare module '*.svg' {
  const src: string;
  export default src;
}

declare module '*.jpg' {
  const src: string;
  export default src;
}

declare module '*.jpeg' {
  const src: string;
  export default src;
}
