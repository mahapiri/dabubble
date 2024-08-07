import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DirectMessageHeaderComponent } from './direct-message-header.component';

describe('DirectMessageHeaderComponent', () => {
  let component: DirectMessageHeaderComponent;
  let fixture: ComponentFixture<DirectMessageHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DirectMessageHeaderComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DirectMessageHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
