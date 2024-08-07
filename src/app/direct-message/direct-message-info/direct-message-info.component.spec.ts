import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DirectMessageInfoComponent } from './direct-message-info.component';

describe('DirectMessageInfoComponent', () => {
  let component: DirectMessageInfoComponent;
  let fixture: ComponentFixture<DirectMessageInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DirectMessageInfoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DirectMessageInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
