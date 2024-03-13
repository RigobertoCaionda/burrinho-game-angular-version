import { EventEmitter } from "@angular/core";

export class Player {
  isPlaying = false;
  points = 0;

  isPlayingChanged: EventEmitter<boolean> = new EventEmitter<boolean>();

  setPlayingStatus(playing: boolean) {
    this.isPlaying = playing;
    this.isPlayingChanged.emit(playing);
  }

  play(letter: string, playedLetters: string) {
    return playedLetters + '' + letter;
  }
}
