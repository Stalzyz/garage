export class VoiceMemoRecorder {
  private isCurrentlyRecording = false;
  private isCurrentlyPlaying = false;
  private playbackTimer: any = null;

  async requestPermission(): Promise<boolean> {
    return true;
  }

  async startRecording(): Promise<boolean> {
    this.isCurrentlyRecording = true;
    return true;
  }

  async stopRecording(): Promise<string | null> {
    this.isCurrentlyRecording = false;
    const memoId = `memo_${Date.now()}`;
    return `memo://voice-recordings/${memoId}.m4a`;
  }

  async playSound(uri: string, onFinish?: () => void): Promise<boolean> {
    this.isCurrentlyPlaying = true;
    // Simulate playing audio for 3 seconds then fire onFinish
    if (this.playbackTimer) clearTimeout(this.playbackTimer);
    this.playbackTimer = setTimeout(() => {
      this.isCurrentlyPlaying = false;
      if (onFinish) onFinish();
    }, 3000);
    return true;
  }

  async stopSound(): Promise<void> {
    this.isCurrentlyPlaying = false;
    if (this.playbackTimer) {
      clearTimeout(this.playbackTimer);
      this.playbackTimer = null;
    }
  }
}

export const voiceRecorder = new VoiceMemoRecorder();
