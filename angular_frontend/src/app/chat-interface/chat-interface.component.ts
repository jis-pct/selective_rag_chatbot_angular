import { Component, AfterViewChecked, ElementRef, ViewChild, OnInit, OnDestroy  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { NgFor } from '@angular/common';
import { MarkdownModule } from 'ngx-markdown'
import { SharedService } from '../shared.service';
import { Message } from '../models/message.model';

@Component({
    selector: 'app-chat-interface',
    imports: [FormsModule, NgFor, MarkdownModule, CommonModule],
    templateUrl: './chat-interface.component.html',
    styleUrl: './chat-interface.component.css',
    standalone: true
})
export class ChatInterfaceComponent implements AfterViewChecked, OnInit, OnDestroy {
    private apiUrl = 'http://127.0.0.1:5000/chat';
    userMessage = "";
    messages: Message[] = []; // Store all message history
    isWaitingForResponse = false; // Keep track of whether assistant is thinking
    chatParameters!: {model: any, search: any};
    errorMessage = '';

    @ViewChild('chatContainer') private chatContainer!: ElementRef;

    constructor(private http: HttpClient, private sharedService: SharedService) {}
    
    ngOnInit() {
      // Restore state from the shared service
      this.messages = this.sharedService.messages;
      this.userMessage = this.sharedService.userMessage;
      this.errorMessage = this.sharedService.errorMessage;
  
      // Subscribe to chat parameters
      this.sharedService.chatParameters$.subscribe((params) => {
        this.chatParameters = params;
      });
    }
    
    handleKeyDown(event: KeyboardEvent): void {
      if (event.key === 'Enter' && !event.shiftKey) {
        if (this.userMessage.trim() === '') {
          event.preventDefault();
        } else {
          event.preventDefault();
          this.sendMessage();
        }
      }
    }

    sendMessage() {
      // Prevent sending messages on certain conditions
      if ( this.userMessage.trim() === '' || this.isWaitingForResponse || !this.chatParameters || !this.chatParameters.search.indexNameValid || this.errorMessage) {
        return;
      }
      const userMessage = this.userMessage
      this.userMessage = '';
      this.messages.push({role: 'user', content: userMessage, displayableContent: userMessage});
      this.isWaitingForResponse = true;

      this.http
      .post<Message | { error: string; details: string }>(this.apiUrl, {
        messages: this.messages,
        parameters: this.chatParameters
      })
      .subscribe({
        next: (res) => {
          if ('error' in res) {
            this.errorMessage = res.error + (res.details ? `: ${res.details}` : '');
          } else {
            this.messages.push(res as Message);
          }
          this.isWaitingForResponse = false;
        }
      });
    }
    
    ngAfterViewChecked() {
      this.scrollToBottom();
    }
    
    // Adjusts textarea size upwards if needed
    adjustTextareaHeight(event: Event) {
      const textarea = event.target as HTMLTextAreaElement;
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }

    private scrollToBottom() {
      this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
    }
    
    clearChat() {
      this.messages =[];
      this.errorMessage = '';
    }

    ngOnDestroy() {
      // Save state to the shared service
      this.sharedService.messages = this.messages;
      this.sharedService.userMessage = this.userMessage;
      this.sharedService.errorMessage = this.errorMessage;
    }
}
