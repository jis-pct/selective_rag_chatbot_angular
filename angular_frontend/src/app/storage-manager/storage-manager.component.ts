import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-storage-manager',
  templateUrl: './storage-manager.component.html',
  styleUrl: './storage-manager.component.css',
  standalone: true,
  imports: [ FormsModule, NgFor, CommonModule ]
})
export class StorageManagerComponent implements OnInit {
  containers: string[] = []; 
  selectedContainer: string = ''; 
  files: string[] = [];
  isLoading = false;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.fetchContainers();
  }

  fetchContainers() {
    this.http.get<string[]>('http://127.0.0.1:5000/list-containers').subscribe(
      (response) => {
        this.containers = response;
      });
  }

  fetchFiles(containerName: string) {
    if (!this.selectedContainer) return;
    this.http.get<string[]>(`http://127.0.0.1:5000/${this.selectedContainer}/list-files`).subscribe(
      (response) => {
        this.files = response;
      });
  }

  // Delete a file from the selected container
  deleteFile(filename: string) {
    if (!this.selectedContainer) return;
    this.http
      .post<{ success: boolean }>(`http://127.0.0.1:5000/delete-file`, {
        container: this.selectedContainer,
        filename: filename
      }).subscribe( (res) => {
          if (res.success) {
            console.log(`File ${filename} deleted successfully.`);
          } else {
            console.log(`Error deleting ${filename}.`);
          }
          this.fetchFiles(this.selectedContainer);
        });
  }

  // Upload a file to the selected container
  uploadFile(event: Event) {
    if (!this.selectedContainer) return;

    const input = event.target as HTMLInputElement;
    const file = input.files ? input.files[0] : null;

    if (file) {
      const formData = new FormData();
      formData.append('file', file);
      formData.set('container', this.selectedContainer);

      this.http
        .post<{ success: boolean }>(`http://127.0.0.1:5000/upload-file`, formData)
        .subscribe(
          (res) => {
            if (res.success) {
              console.log(`File ${file.name} uploaded successfully.`);
            } else { console.log(`Error uploading ${file.name}.`);
            }
            this.fetchFiles(this.selectedContainer);
          }
        )
      }
  }
}