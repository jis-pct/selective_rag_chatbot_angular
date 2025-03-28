import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatSliderModule } from '@angular/material/slider';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Subject } from 'rxjs';
import { debounceTime, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-sidebar',
  imports: [FormsModule, MatSliderModule, MatCheckboxModule, CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  modelParameters = {
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
  }
  searchParameters = {
    indexName: 'rag-storage',
    limitScope: true,
    strictness: 3,
    topNDocuments: 5
  }

  private indexNameSubject = new Subject<string>();
  isIndexNameValid = true;

  constructor(private http: HttpClient) {
    // Subscribe to the Subject and debounce the validation requests
    this.indexNameSubject
      .pipe(
        debounceTime(100), // Wait till user stops typing
        switchMap((indexName) => this.validateIndexName(indexName))
      )
      .subscribe((isValid) => {
        this.isIndexNameValid = isValid.valid;
        console.log('Index name validation result:', isValid);
      });
  }

  private validateIndexName(indexName: string) {
    const apiUrl = 'http://127.0.0.1:5000/validate-index';
    return this.http.post<{valid: boolean}>(apiUrl, { indexName: indexName });
  }

  public onIndexNameChange() {
    this.indexNameSubject.next(this.searchParameters.indexName);
  }

  public getParameters() {
    return {
      modelParameters: this.modelParameters,
      searchParameters: this.searchParameters}
  }

  public showParams() {
    console.log(this.modelParameters);
    console.log(this.searchParameters);
  }
}
