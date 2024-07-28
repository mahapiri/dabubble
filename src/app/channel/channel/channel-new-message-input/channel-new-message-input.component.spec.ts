import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChannelNewMessageInputComponent } from './channel-new-message-input.component';

describe('ChannelNewMessageInputComponent', () => {
  let component: ChannelNewMessageInputComponent;
  let fixture: ComponentFixture<ChannelNewMessageInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChannelNewMessageInputComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ChannelNewMessageInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
