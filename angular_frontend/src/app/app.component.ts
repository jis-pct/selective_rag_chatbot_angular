import { Component, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { NgFor } from '@angular/common';
import { MarkdownModule } from 'ngx-markdown'
import { SidebarComponent } from './sidebar/sidebar.component';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    imports: [FormsModule, NgFor, MarkdownModule, SidebarComponent],
  })
  export class AppComponent {
    private apiUrl = 'http://127.0.0.1:5000/chat';
    userMessage = "";
    messages: { role: string; content: string; displayableContent: string }[] = []; // Store all message history
    isWaitingForResponse = false; // Keep track of whether assistant is thinking

    // Get a reference to the SidebarComponent
    @ViewChild(SidebarComponent) sidebar!: SidebarComponent;

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
      return this.http.post<{ role: string; content: string; displayableContent: string; }>(this.apiUrl, 
        { messages: this.messages, parameters: this.sidebar.getParameters()}).subscribe((response) => {
        this.messages.push(response);
        this.isWaitingForResponse = false;
      });
    }
  }