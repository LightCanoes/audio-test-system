export interface WebSocketMessage {
  type: string;
  [key: string]: any;
}

export interface Test {
  id: string;
  name: string;
  questions: Question[];
}

export interface Question {
  id: number;
  options: string[];
  audioFile: string;
}

export interface Answer {
  questionId: number;
  option: string;
  timestamp: number;
  startTime: number;
}

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected';
export type TestStatus = 'waiting' | 'started' | 'ended';
export type QuestionStatus = 'waiting' | 'active' | 'answered';
