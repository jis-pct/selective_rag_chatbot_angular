import { Component, Injectable } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import {FormsModule} from '@angular/forms';

// @Component({
//   selector: 'app-root',
//   template: `
//   HELLOcdbvasqrvfesdfvgnesvdfngdfrv
//   sngvxbfdnvbfdsngbvsvnb!
//   `,
//   imports: [RouterOutlet],
//   // templateUrl: './app.component.html',
//   // styleUrl: './app.component.css'
// })
// export class AppComponent {
//   title = 'angular_frontend';
// }

@Component({
    selector: 'app-root',
    template: `
      <div>
        <h1>Selective RAG Chatbot</h1>
        <input type="text" [(ngModel)] = "userMessage" placeholder="Type a message..." (keyup.enter)="sendMessage()" />
      </div>
    `,
    imports: [FormsModule],
  })
  export class AppComponent {
    private apiUrl = 'http://127.0.0.1:5000/chat';
    userMessage = "";

    constructor(private http: HttpClient) {}

    sendMessage() {
      return this.http.post(this.apiUrl, 
        { message: this.userMessage, index_name: 'rag-storage-2'}).subscribe((response) => {
        console.log(response);
      });
    }
  }