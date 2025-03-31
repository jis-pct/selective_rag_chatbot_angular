import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatSliderModule } from '@angular/material/slider';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, switchMap } from 'rxjs/operators';
import { SharedService } from '../../shared.service';

@Component({
  selector: 'app-chat-sidebar',
  imports: [FormsModule, MatSliderModule, MatCheckboxModule, CommonModule],
  templateUrl: './chat-sidebar.component.html',
  styleUrl: './chat-sidebar.component.css'
})
export class ChatSidebarComponent implements OnInit, OnDestroy {
  public indexNameSubject = new Subject<string>();
  public isIndexNameValid = true;
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
      limitScope: false,
      strictness: 0,
      topNDocuments: 0,
    },
  };
  private paramSubscription!: Subscription;

  constructor(private http: HttpClient, private sharedService: SharedService) {}

  ngOnInit() {
     // Get default params
    this.sharedService.retrieveChatParameters().subscribe((params) => {
      this.chatParameters = params;
    });
    
    // Subscribe to the Subject and debounce the validation requests
    this.indexNameSubject
      .pipe(
        debounceTime(100), // Wait till user stops typing
        switchMap((indexName) => this.validateIndexName(indexName))
      )
      .subscribe((isValid) => {
        this.isIndexNameValid = isValid.valid;
      });
  }

  private validateIndexName(indexName: string) {
    const apiUrl = 'http://127.0.0.1:5000/validate-index';
    return this.http.post<{valid: boolean}>(apiUrl, { indexName: indexName });
  }

  public onIndexNameChange() {
    this.indexNameSubject.next(this.chatParameters.search.indexName);
  }

  public pushUpdatesToSharedService() {
    this.sharedService.updateChatParameters(this.chatParameters);
  }

  ngOnDestroy(){
    this.indexNameSubject.unsubscribe();
  }
}
