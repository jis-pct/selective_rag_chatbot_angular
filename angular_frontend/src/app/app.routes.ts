import { Routes } from '@angular/router';
import { ChatInterfaceComponent } from './chat-interface/chat-interface.component';
import { StorageManagerComponent } from './storage-manager/storage-manager.component';


export const routes: Routes = [
    {path: '', component: ChatInterfaceComponent},
    {path: 'storage-manager', component: StorageManagerComponent}
];
