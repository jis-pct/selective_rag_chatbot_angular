import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SharedService {
  public chatParameters = new BehaviorSubject<any>({
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
      limitScope: true,
      strictness: 3,
      topNDocuments: 5
    }
  });

  updateChatParameters(parameters: any) {
    this.chatParameters.next(parameters);
  }

  retrieveChatParameters(): Observable<any> {
    return this.chatParameters.asObservable();
  }
}
