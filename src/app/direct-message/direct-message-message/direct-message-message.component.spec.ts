import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DirectMessageMessageComponent } from './direct-message-message.component';

describe('DirectMessageMessageComponent', () => {
  let component: DirectMessageMessageComponent;
  let fixture: ComponentFixture<DirectMessageMessageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DirectMessageMessageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DirectMessageMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
