// src/services/audioService.ts
import axios from 'axios';
import { AUTH_TOKEN } from '../config/token';
import { WaveFile } from 'wavefile';

export interface RecordingState {
  isRecording: boolean;
  audioURL: string | null;
}

export const requestMicrophoneAccess = async (): Promise<MediaStream> => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    return stream;
  } catch (error) {
    console.error('Error accessing microphone:', error);
    throw error;
  }
};

export class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;

  public async startRecording(): Promise<void> {
    this.stream = await requestMicrophoneAccess();
    this.mediaRecorder = new MediaRecorder(this.stream);
    this.audioChunks = [];

    this.mediaRecorder.addEventListener('dataavailable', (event) => {
      if (event.data.size > 0) {
        this.audioChunks.push(event.data);
      }
    });

    this.mediaRecorder.start();
  }

  public stopRecording(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) return reject(new Error('No recording in progress'));

      this.mediaRecorder.addEventListener('stop', () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        this.stopStream();
        resolve(audioBlob);
      });

      this.mediaRecorder.stop();
    });
  }

  private stopStream(): void {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
  }

  public static createAudioURL(blob: Blob): string {
    return URL.createObjectURL(blob);
  }

  public static revokeAudioURL(url: string): void {
    URL.revokeObjectURL(url);
  }

  public static textToSpeech(text: string, lang: string = 'ko-KR'): SpeechSynthesisUtterance {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    return utterance;
  }

  public static isKoreanText(text: string): boolean {
    return !!text.match(/[ㄱ-ㅣ|가-힣]/);
  }
}

const api = axios.create({
  baseURL: 'http://175.212.190.95:8010',
  headers: {
    Authorization: AUTH_TOKEN,
  },
});

export const transcribeAudio = async (blob: Blob): Promise<string> => {
  const arrayBuffer = await blob.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);

  const wav = new WaveFile();
  wav.fromScratch(1, 48000, '16', uint8Array);
  const wavBlob = new Blob([wav.toBuffer()], { type: 'audio/wav' });

  const formData = new FormData();
  formData.append('file', new File([wavBlob], 'voice.wav', { type: 'audio/wav' }));

  const res = await api.post('/api/v1/transcribe', formData);
  return res.data.transcription;
};