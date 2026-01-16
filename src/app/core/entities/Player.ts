export class Player {
  isPlaying = false;
  score = 0;
  constructor(
    public id: number,
    public name: string,
    public email: string,
  ) {}

  public play(letter: string, playedLetters: string): string {
    return playedLetters + '' + letter;
  }
  setPlayingStatus(isPlaying: boolean) {
    this.isPlaying = isPlaying;
  }
}