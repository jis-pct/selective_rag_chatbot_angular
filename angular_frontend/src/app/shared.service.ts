import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Message } from './models/message.model';

@Injectable({
  providedIn: 'root'
})
export class SharedService {
  // Chat parameters
  private defaultChatParameters = {
    model:{
      systemMessage: "You are an AI assistant that helps users find information. \
Please answer using retrieved documents only \
and without using your own knowledge. Generate citations to retrieved documents for \
every claim in your response. Do not answer using your own knowledge.",
      pastMessagesIncluded: 10,
      maxResponse: 800,
      temperature: 1,
      topP: 1,
      stopPhrase: "",
      frequencyPenalty: 0,
      presencePenalty: 0
    },
    search: {
      indexName: 'rag-storage',
      indexNameValid: true,
      limitScope: true,
      strictness: 3,
      topNDocuments: 5
    }
  }
  private chatParametersSubject = new BehaviorSubject<any>(JSON.parse(JSON.stringify(this.defaultChatParameters)));

  // Chat interface variables saved here to save state on page change
  userMessage = "";
  messages: Message[] = [];
  errorMessage = '';

  // Observable for components to subscribe to
  chatParameters$ = this.chatParametersSubject.asObservable();

  // Method to retrieve the current chat parameters
  getChatParameters() {
    return this.chatParametersSubject.value;
  }

  // Method to update the chat parameters
  updateChatParameters(newParameters: any) {
    this.chatParametersSubject.next(newParameters);
  }

  // Method to reset chat parameters to default
  resetChatParameters() {
    this.chatParametersSubject.next(JSON.parse(JSON.stringify(this.defaultChatParameters)));
  }
}
