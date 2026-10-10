import { ComponentFixture, TestBed } from '@angular/core/testing';
import { JunkDrawer } from './junk-drawer';

describe('JunkDrawer', () => {
  let component: JunkDrawer;
  let fixture: ComponentFixture<JunkDrawer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JunkDrawer]
    })
      .compileComponents();

    fixture = TestBed.createComponent(JunkDrawer);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
