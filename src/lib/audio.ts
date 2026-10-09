// Original procedural music and decorative sounds. No streaming or external assets.
export class GuildAudio {
  context: AudioContext | null = null;
  master: GainNode | null = null;
  music = false;
  sounds = false;
  volume = 0.3;
  timer: ReturnType<typeof setInterval> | null = null;
  beat = 0;
  async activate() {
    if (!this.context) {
      this.context = new AudioContext();
      this.master = this.context.createGain();
      this.master.connect(this.context.destination);
    }
    if (this.context.state === "suspended") await this.context.resume();
    this.master!.gain.setTargetAtTime(
      this.volume * 0.45,
      this.context.currentTime,
      0.1,
    );
    if (!this.timer) this.timer = setInterval(() => this.tick(), 430);
  }
  setVolume(volume: number) {
    this.volume = volume;
    if (this.context && this.master)
      this.master.gain.setTargetAtTime(
        volume * 0.45,
        this.context.currentTime,
        0.1,
      );
  }
  note(
    frequency: number,
    length: number,
    gain = 0.1,
    type: OscillatorType = "sine",
  ) {
    if (!this.context || !this.master) return;
    const now = this.context.currentTime,
      oscillator = this.context.createOscillator(),
      envelope = this.context.createGain();
    oscillator.type = type;
    oscillator.frequency.value = frequency;
    envelope.gain.setValueAtTime(0, now);
    envelope.gain.linearRampToValueAtTime(gain, now + 0.015);
    envelope.gain.exponentialRampToValueAtTime(0.0001, now + length);
    oscillator.connect(envelope);
    envelope.connect(this.master);
    oscillator.start(now);
    oscillator.stop(now + length + 0.1);
    oscillator.onended = () => {
      oscillator.disconnect();
      envelope.disconnect();
    };
  }
  tick() {
    if (document.hidden || this.context?.state !== "running") return;
    if (this.music) {
      const progression = [
        [130.81, 164.81, 196],
        [110, 130.81, 164.81],
        [87.31, 110, 130.81],
        [98, 123.47, 146.83],
      ];
      const chord =
        progression[Math.floor(this.beat / 16) % progression.length];
      if (this.beat % 8 === 0)
        chord.forEach((f) => this.note(f, 2.9, 0.045, "triangle"));
      const melody = [0, 2, 1, 2, 0, 1, 2, 1];
      if (this.beat % 2 === 0)
        this.note(chord[melody[Math.floor(this.beat / 2) % 8]] * 2, 0.7, 0.065);
    }
    if (this.sounds && this.beat % 19 === 0) {
      this.note(640 + Math.random() * 180, 0.03, 0.05, "triangle");
      this.note(140, 0.13, 0.035);
    }
    this.beat++;
  }
  dispose() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
    void this.context?.close();
  }
}
