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
  public chatParameters: any;

  constructor(private http: HttpClient, private sharedService: SharedService) {}

  ngOnInit() {
     // Subscribe to chat parameters
    this.sharedService.chatParameters$.subscribe(params => {
      this.chatParameters = params;
    });

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
    this.sharedService.resetChatParameters();
  }

  ngOnDestroy(){
    this.indexNameSubject.unsubscribe();
  }
}
