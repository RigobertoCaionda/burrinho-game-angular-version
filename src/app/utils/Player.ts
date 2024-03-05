export class Player {
  isPlaying = false;
  points = 0;
  play(letter: string, playedLetters: string) {
    return playedLetters+''+letter;
  }
  answerFromInterrogation() {

  }
}
