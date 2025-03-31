import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StorageSidebarComponent } from './storage-sidebar.component';

describe('StorageSidebarComponent', () => {
  let component: StorageSidebarComponent;
  let fixture: ComponentFixture<StorageSidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StorageSidebarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StorageSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
