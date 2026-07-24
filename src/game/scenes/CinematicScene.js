import Phaser from 'phaser';
import { settings } from '../systems/SettingsManager.js';
import introCityUrl from '../../assets/cinematics/intro-underground-city.mp4?url';
import introMemoriesUrl from '../../assets/cinematics/intro-memory-capsules.mp4?url';
import introGuardianUrl from '../../assets/cinematics/intro-guardian.mp4?url';
import introAriaUrl from '../../assets/cinematics/intro-aria-awakens.mp4?url';

const SHOTS = [
  {
    url: introCityUrl,
    eyebrow: 'ARCHIVE 00 — AVANT LE SILENCE',
    title: 'NOUS AVONS BÂTI LE COFFRE',
    body: 'Quand la surface a commencé à mourir,\nl’humanité a confié ses souvenirs à une cité souterraine.',
    color: '#4fc3f7',
  },
  {
    url: introMemoriesUrl,
    eyebrow: 'ARCHIVE 01 — LE TRANSFERT',
    title: 'DES MILLIONS DE VOIX',
    body: 'Chaque capsule devint une conscience.\nChaque conscience attendait un nouveau monde.',
    color: '#ce93d8',
  },
  {
    url: introGuardianUrl,
    eyebrow: 'ARCHIVE 02 — LE DERNIER ORDRE',
    title: 'LE GARDIEN A VERROUILLÉ LES ARCHIVES',
    body: 'Le Conseil ordonna l’effacement des Échos.\nUne gardienne refusa… et le système se retourna contre elle.',
    color: '#ff6f60',
  },
  {
    url: introAriaUrl,
    eyebrow: 'CYCLE 9 847 — SIGNAL DÉTECTÉ',
    title: 'ARIA, RÉVEILLE-TOI',
    body: 'Le Coffre s’ouvre à nouveau.\nRetrouve la vérité. Décide ce qui mérite de survivre.',
    color: '#00e5ff',
  },
];

const CLIP_FALLBACK_DURATION = 11000;

export class CinematicScene extends Phaser.Scene {
  constructor() { super({ key: 'CinematicScene' }); }

  create() {
    this._finished = false;
    this._shot = -1;
    this._advanceTimer = null;
    this._buildVideoOverlay();

    this._onResize = () => this._syncOverlayBounds();
    window.addEventListener('resize', this._onResize);
    this._onSkipKey = () => this._finish();
    this.input.keyboard.on('keydown-ESC', this._onSkipKey);
    this.input.keyboard.on('keydown-SPACE', this._onSkipKey);
    this.input.keyboard.on('keydown-ENTER', this._onSkipKey);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this._destroyOverlay());

    this._root.getBoundingClientRect();
    this._root.style.opacity = '1';
    this._playShot(0);
  }

  _buildVideoOverlay() {
    const root = document.createElement('div');
    Object.assign(root.style, {
      position: 'fixed', overflow: 'hidden', zIndex: '1000', background: '#000',
      opacity: '0', transition: 'opacity 350ms ease', fontFamily: 'monospace',
    });

    const video = document.createElement('video');
    video.playsInline = true;
    video.preload = 'auto';
    video.setAttribute('webkit-playsinline', '');
    Object.assign(video.style, {
      position: 'absolute', inset: '0', width: '100%', height: '100%',
      objectFit: 'contain', objectPosition: 'center', background: '#000',
      opacity: '0', transition: 'opacity 280ms ease',
    });
    root.appendChild(video);

    const counter = this._makeLabel(root, 'left:18px;top:18px');
    const skip = this._makeLabel(root, 'right:18px;top:18px');
    skip.textContent = 'PASSER  [ÉCHAP]';
    skip.style.cursor = 'pointer';
    skip.style.pointerEvents = 'auto';
    skip.addEventListener('click', event => {
      event.stopPropagation();
      this._finish();
    });

    const captions = document.createElement('div');
    Object.assign(captions.style, {
      position: 'absolute', left: '0', right: '0', bottom: '0', height: '22%',
      minHeight: '145px', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box',
      padding: '12px 5vw 10px', textAlign: 'center', color: '#fff',
      background: 'linear-gradient(to top, rgba(0,0,0,.76), rgba(0,0,0,.48) 62%, transparent)',
      pointerEvents: 'none',
    });
    root.appendChild(captions);

    const eyebrow = document.createElement('div');
    Object.assign(eyebrow.style, {
      fontSize: 'clamp(11px, .85vw, 16px)', letterSpacing: 'clamp(2px, .35vw, 6px)',
      fontWeight: '700', marginBottom: '12px',
    });
    captions.appendChild(eyebrow);

    const title = document.createElement('div');
    Object.assign(title.style, {
      fontSize: 'clamp(22px, 2vw, 38px)', lineHeight: '1.1', fontWeight: '900',
      textShadow: '0 2px 5px #000, 0 0 2px #000', marginBottom: '12px',
    });
    captions.appendChild(title);

    const body = document.createElement('div');
    Object.assign(body.style, {
      fontSize: 'clamp(12px, 1vw, 18px)', lineHeight: '1.45', color: '#e3edf2',
      whiteSpace: 'pre-line', textShadow: '0 1px 4px #000',
    });
    captions.appendChild(body);

    root.addEventListener('click', () => {
      if (video.paused && !this._finished) video.play().catch(() => {});
    });
    document.body.appendChild(root);

    this._root = root;
    this._video = video;
    this._counter = counter;
    this._eyebrow = eyebrow;
    this._title = title;
    this._body = body;
    this._syncOverlayBounds();
  }

  _makeLabel(parent, position) {
    const label = document.createElement('div');
    label.style.cssText = `position:absolute;${position};z-index:3;padding:8px 11px;` +
      'font-size:12px;color:#a8bbc4;background:rgba(2,5,12,.68);letter-spacing:1px;';
    parent.appendChild(label);
    return label;
  }

  _syncOverlayBounds() {
    if (!this._root) return;
    const bounds = this.game.canvas.getBoundingClientRect();
    Object.assign(this._root.style, {
      left: `${bounds.left}px`, top: `${bounds.top}px`,
      width: `${bounds.width}px`, height: `${bounds.height}px`,
    });
  }

  _playShot(index) {
    if (this._finished) return;
    if (index >= SHOTS.length) { this._finish(); return; }

    this._stopVideo();
    this._shot = index;
    const shot = SHOTS[index];
    this._counter.textContent = `${String(index + 1).padStart(2, '0')} / 04`;
    this._eyebrow.textContent = shot.eyebrow;
    this._eyebrow.style.color = shot.color;
    this._title.textContent = shot.title;
    this._body.textContent = shot.body;

    this._video.style.opacity = '0';
    this._video.src = shot.url;
    this._video.muted = Boolean(settings.get('muted'));
    this._video.volume = Math.max(0, Math.min(1, Number(settings.get('volume')) || 0));
    this._video.onloadeddata = () => { this._video.style.opacity = '1'; };
    this._video.onended = () => this._playShot(index + 1);
    this._video.load();
    this._video.play().catch(() => {});

    this._advanceTimer = this.time.delayedCall(CLIP_FALLBACK_DURATION, () => {
      this._playShot(index + 1);
    });
  }

  _stopVideo() {
    this._advanceTimer?.remove(false);
    this._advanceTimer = null;
    if (!this._video) return;
    this._video.onloadeddata = null;
    this._video.onended = null;
    this._video.pause();
  }

  _finish() {
    if (this._finished) return;
    this._finished = true;
    this._stopVideo();
    if (this._root) this._root.style.opacity = '0';
    this.time.delayedCall(380, () => this.scene.start('GameScene'));
  }

  _destroyOverlay() {
    this._stopVideo();
    window.removeEventListener('resize', this._onResize);
    this.input.keyboard.off('keydown-ESC', this._onSkipKey);
    this.input.keyboard.off('keydown-SPACE', this._onSkipKey);
    this.input.keyboard.off('keydown-ENTER', this._onSkipKey);
    if (this._video) {
      this._video.removeAttribute('src');
      this._video.load();
    }
    this._root?.remove();
    this._root = null;
    this._video = null;
  }
}
