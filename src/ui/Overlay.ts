import { bus } from '../core/EventBus';

export class Overlay {
  private overlay!: HTMLElement;
  private hud!: HTMLElement;
  private crosshair!: HTMLElement;
  private fade!: HTMLElement;

  init() {
    // 1. Inject HTML into body first
    const html = `
      <div id="overlay">
        <div class="era">КАЗАХСТАН · I В.</div>
        <h1>ҚАЗАҚ</h1>
        <h2>СИМУЛЯТОР</h2>
        <div class="hint"><span>· нажмите для начала ·</span></div>
      </div>
      <div id="vignette"></div>
      <div id="fade"></div>
      <div id="crosshair"></div>
      <div id="hud">W A S D — движение &nbsp;·&nbsp; мышь — взгляд &nbsp;·&nbsp; ESC — пауза</div>
    `;
    document.body.insertAdjacentHTML('beforeend', html);

    // 2. Bind elements
    this.overlay   = document.getElementById('overlay')!;
    this.hud       = document.getElementById('hud')!;
    this.crosshair = document.getElementById('crosshair')!;
    this.fade      = document.getElementById('fade')!;

    // 3. Wire events
    bus.on('lockchange', (locked: unknown) => {
      this.overlay.style.display   = locked ? 'none' : 'flex';
      this.hud.style.display       = locked ? 'block' : 'none';
      this.crosshair.style.display = locked ? 'block' : 'none';
      if (locked) setTimeout(() => { this.fade.style.opacity = '0'; }, 200);
    });

    bus.on('awake', () => {
      this.fade.style.opacity = '0';
    });
  }
}
