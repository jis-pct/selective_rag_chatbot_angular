import { Component, Injectable } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { NgFor } from '@angular/common';
import { MarkdownModule } from 'ngx-markdown';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    imports: [FormsModule, NgFor, MarkdownModule],
  })
  export class AppComponent {
    private apiUrl = 'http://127.0.0.1:5000/chat';
    userMessage = "";
    messages: { role: string; content: string; displayableContent: string }[] = []; // Store all message history
    isWaitingForResponse = false; // Keep track of whether assistant is thinking

    constructor(private http: HttpClient) {}

    sendMessage() {
      if (this.userMessage.trim() == '' || this.isWaitingForResponse) {
        return; // Prevent sending empty messages or before assistant responds to last message
      }
      const userMessage = this.userMessage
      this.userMessage = '';
      this.messages.push({role: 'user', content: userMessage, displayableContent: userMessage});
      this.isWaitingForResponse = true;

      // Send message to backend and wait for response
      return this.http.post(this.apiUrl, 
        { messages: this.messages, index_name: 'rag-storage'}).subscribe((response) => {
        const formattedResponse = response as { role: string; content: string; displayableContent: string };
        this.messages.push(formattedResponse);
        this.isWaitingForResponse = false;
      });
    }
  }