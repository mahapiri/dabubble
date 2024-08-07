import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DirectMessageNewMessageInputComponent } from './direct-message-new-message-input.component';

describe('DirectMessageNewMessageInputComponent', () => {
  let component: DirectMessageNewMessageInputComponent;
  let fixture: ComponentFixture<DirectMessageNewMessageInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DirectMessageNewMessageInputComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DirectMessageNewMessageInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
