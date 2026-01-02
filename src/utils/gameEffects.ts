
// Game sound effects using Web Audio API
export class GameAudio {
  private audioContext: AudioContext | null = null;

  constructor() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.warn('Web Audio API not supported');
    }
  }

  private createTone(frequency: number, duration: number, type: OscillatorType = 'sine') {
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = type;

    gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  playMoveSound() {
    this.createTone(200, 0.1, 'square');
  }

  playSuccessSound() {
    // Play a success melody
    setTimeout(() => this.createTone(523, 0.2), 0);    // C
    setTimeout(() => this.createTone(659, 0.2), 200);  // E
    setTimeout(() => this.createTone(784, 0.4), 400);  // G
  }

  playErrorSound() {
    this.createTone(150, 0.3, 'sawtooth');
  }
}

// Visual effects utilities
export const createParticle = (x: number, y: number, color: string) => {
  const particle = document.createElement('div');
  particle.style.position = 'absolute';
  particle.style.left = x + 'px';
  particle.style.top = y + 'px';
  particle.style.width = '4px';
  particle.style.height = '4px';
  particle.style.backgroundColor = color;
  particle.style.borderRadius = '50%';
  particle.style.pointerEvents = 'none';
  particle.style.zIndex = '1000';
  particle.style.transition = 'all 1s ease-out';
  
  document.body.appendChild(particle);
  
  // Animate particle
  setTimeout(() => {
    particle.style.transform = `translate(${(Math.random() - 0.5) * 100}px, ${-50 - Math.random() * 50}px)`;
    particle.style.opacity = '0';
  }, 10);
  
  // Remove particle
  setTimeout(() => {
    if (document.body.contains(particle)) {
      document.body.removeChild(particle);
    }
  }, 1000);
};

export const createSuccessParticles = (element: HTMLElement) => {
  const rect = element.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  
  const colors = ['#FF1B8D', '#9747FF', '#4F46E5', '#06B6D4', '#10B981'];
  
  for (let i = 0; i < 15; i++) {
    setTimeout(() => {
      createParticle(
        centerX + (Math.random() - 0.5) * rect.width,
        centerY + (Math.random() - 0.5) * rect.height,
        colors[Math.floor(Math.random() * colors.length)]
      );
    }, i * 50);
  }
};
