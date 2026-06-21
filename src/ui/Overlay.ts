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
        <div class="credits">Модель юрты: <a href="https://sketchfab.com/3d-models/3-adb8c343568640aa936fd8c1deee7a6a" target="_blank" rel="noopener noreferrer">zhanerke.badambay</a> (CC BY 4.0)</div>
      </div>
      <div id="vignette"></div>
      <div id="fade"></div>
      <div id="crosshair"></div>
      <div id="hud">W A S D — движение &nbsp;·&nbsp; C — присесть &nbsp;·&nbsp; Ctrl — лечь &nbsp;·&nbsp; Пробел — встать &nbsp;·&nbsp; мышь — взгляд &nbsp;·&nbsp; ESC — пауза</div>
    `;
    document.body.insertAdjacentHTML('beforeend', html);

    // 2. Bind elements
    this.overlay   = document.getElementById('overlay')!;
    this.hud       = document.getElementById('hud')!;
    this.crosshair = document.getElementById('crosshair')!;
    this.fade      = document.getElementById('fade')!;

    // Clicking the overlay requests pointer lock on the canvas
    this.overlay.addEventListener('click', () => {
      const canvas = document.querySelector('canvas');
      canvas?.requestPointerLock();
    });

    // Stop propagation on credits link click to prevent starting pointer lock
    const link = this.overlay.querySelector('.credits a');
    link?.addEventListener('click', (e) => {
      e.stopPropagation();
    });

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
