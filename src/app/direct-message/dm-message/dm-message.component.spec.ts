import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DmMessageComponent } from './dm-message.component';

describe('DmMessageComponent', () => {
  let component: DmMessageComponent;
  let fixture: ComponentFixture<DmMessageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DmMessageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DmMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
