export interface Message {
    role: 'user' | 'assistant' | 'system';
    content: string;
    displayableContent: string;
  }