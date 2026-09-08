/// Notification tones for the admin app, synthesised rather than shipped as
/// audio files — they work offline and add nothing to the bundle.
///
/// One synthesiser, several presets. The barista needs to tell what happened
/// without looking up, so the tones differ in shape rather than only in pitch:
/// a rising pair means a drink to make, a falling pair means a person waiting
/// on a decision.
export interface IChimeTone {
  /// Frequencies in Hz, played in order.
  notes: readonly number[];
  /// Seconds between the start of each note.
  spacing: number;
  /// Peak gain. Kept well under 1 — this plays on a counter, not a stage.
  volume: number;
  /// Seconds until the envelope has decayed.
  decay: number;
}

/// A new ticket on the queue. Rising, bright, over quickly.
export const newOrderChime: IChimeTone = {
  notes: [880, 1320],
  spacing: 0.11,
  volume: 0.14,
  decay: 0.55,
};

/// An online order waiting for approval. Falling and lower — somebody has paid
/// and is now watching a screen, which is a different kind of urgent from a cup
/// that needs pouring.
export const onlineOrderChime: IChimeTone = {
  notes: [740, 554],
  spacing: 0.16,
  volume: 0.16,
  decay: 0.75,
};

/// A customer has written something. Single, soft, easy to ignore during a
/// rush — a message is not as urgent as either of the above.
export const messageChime: IChimeTone = {
  notes: [988],
  spacing: 0,
  volume: 0.09,
  decay: 0.4,
};

export const playChime = (tone: IChimeTone): void => {
  try {
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctor) return;

    const ctx = new Ctor();
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(tone.volume, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + tone.decay);
    gain.connect(ctx.destination);

    const tail = tone.decay + tone.spacing * tone.notes.length;

    tone.notes.forEach((frequency, index) => {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = frequency;
      osc.connect(gain);
      osc.start(ctx.currentTime + index * tone.spacing);
      osc.stop(ctx.currentTime + tail);
    });

    window.setTimeout(() => void ctx.close(), (tail + 0.3) * 1000);
  } catch {
    // Autoplay policy or no audio device — the visual toast still fires.
  }
};
