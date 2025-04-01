import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { debounceTime, switchMap } from 'rxjs/operators';
import { SharedService } from '../../shared.service';

@Component({
  selector: 'app-chat-sidebar',
  imports: [FormsModule, CommonModule],
  templateUrl: './chat-sidebar.component.html',
  styleUrl: './chat-sidebar.component.css'
})
export class ChatSidebarComponent implements OnInit, OnDestroy {
  public indexNameSubject = new Subject<string>();
  public chatParameters = {
    model: {
      systemMessage: '',
      pastMessagesIncluded: 0,
      maxResponse: 0,
      temperature: 0,
      topP: 0,
      stopPhrase: '',
      frequencyPenalty: 0,
      presencePenalty: 0,
    },
    search: {
      indexName: '',
      indexNameValid: false,
      limitScope: false,
      strictness: 0,
      topNDocuments: 0,
    },
  };

  constructor(private http: HttpClient, private sharedService: SharedService) {}

  ngOnInit() {
     // Get default params
    this.chatParameters = this.sharedService.retrieveChatParameters()

    // Subscribe to the Subject and debounce the validation requests
    this.indexNameSubject
      .pipe(
        debounceTime(50), // Wait till user stops typing
        switchMap((indexName) => this.validateIndexName(indexName))
      )
      .subscribe((isValid) => {
        this.chatParameters.search.indexNameValid = isValid.valid;
      });
  }

  private validateIndexName(indexName: string) {
    const apiUrl = 'http://127.0.0.1:5000/validate-index';
    return this.http.post<{valid: boolean}>(apiUrl, { indexName: indexName });
  }

  public onIndexNameChange() {
    this.indexNameSubject.next(this.chatParameters.search.indexName);
  }

  resetToDefault() {
    this.chatParameters = this.sharedService.resetChatParameters();
  }

  ngOnDestroy(){
    this.indexNameSubject.unsubscribe();
  }
}
