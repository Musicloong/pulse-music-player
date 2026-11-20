const sampleRate = 22050;

export function createDemoAudio(track: number, duration: number) {
  const samples = sampleRate * duration;
  const file = new ArrayBuffer(44 + samples * 2);
  const header = new DataView(file);
  const pcm = new Int16Array(file, 44);
  const text = (offset: number, value: string) =>
    [...value].forEach((letter, index) => header.setUint8(offset + index, letter.charCodeAt(0)));

  text(0, "RIFF");
  header.setUint32(4, file.byteLength - 8, true);
  text(8, "WAVE");
  text(12, "fmt ");
  header.setUint32(16, 16, true);
  header.setUint16(20, 1, true);
  header.setUint16(22, 1, true);
  header.setUint32(24, sampleRate, true);
  header.setUint32(28, sampleRate * 2, true);
  header.setUint16(32, 2, true);
  header.setUint16(34, 16, true);
  text(36, "data");
  header.setUint32(40, samples * 2, true);

  const beat = 60 / [104, 90, 114, 82][track];
  const roots = [110, 130.81, 146.83, 98];
  const melody = [0, 7, 12, 15, 12, 7, 10, 7];
  let phase = 0;
  for (let i = 0; i < samples; i++) {
    const t = i / sampleRate;
    const pulse = t % beat;
    const subdivision = (t % (beat / 2)) * 2;
    const chord = [0, -4, -2, -5][Math.floor(t / (beat * 8)) % 4];
    const root = roots[track] * 2 ** (chord / 12);
    const note = melody[(Math.floor(t / (beat / 2)) + track * 2) % melody.length];
    phase += 2 * Math.PI * root * 2 ** (note / 12) / sampleRate;
    const pluck = (Math.sin(phase) + 0.19 * Math.sin(phase * 2)) *
      Math.min(1, subdivision * 140) * Math.exp(-subdivision * 5);
    const bass = Math.sin(2 * Math.PI * root * 0.5 * t) * Math.sin(Math.PI * pulse / beat);
    const kick = Math.sin(2 * Math.PI * (48 * pulse + 2.8 * (1 - Math.exp(-pulse * 38)))) * Math.exp(-pulse * 17);
    const fade = Math.min(1, t * 5, (duration - t) * 2);
    pcm[i] = (pluck * 0.2 + bass * 0.16 + kick * 0.18) * fade * 32767;
  }
  return URL.createObjectURL(new Blob([file], { type: "audio/wav" }));
}
