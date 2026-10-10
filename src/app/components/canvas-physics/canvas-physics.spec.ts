import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CanvasPhysics } from './canvas-physics';

describe('CanvasPhysics', () => {
  let component: CanvasPhysics;
  let fixture: ComponentFixture<CanvasPhysics>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CanvasPhysics]
    })
      .compileComponents();

    fixture = TestBed.createComponent(CanvasPhysics);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
