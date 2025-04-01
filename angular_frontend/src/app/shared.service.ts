import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SharedService {
  defaultChatParameters = {
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
  
  currentChatParameters = JSON.parse(JSON.stringify(this.defaultChatParameters));

  retrieveChatParameters() {
    return this.currentChatParameters
  }

  resetChatParameters() {
    this.currentChatParameters = JSON.parse(JSON.stringify(this.defaultChatParameters));
    return this.currentChatParameters;
  }
}
