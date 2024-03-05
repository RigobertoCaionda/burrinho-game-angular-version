import { Component, ElementRef, ViewChild } from '@angular/core';
import { Player } from 'src/app/utils/Player';
import { Timer } from 'src/app/utils/Timer';
import { paises } from 'src/app/utils/Players';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from '../dialog/dialog.component';
import { filter } from 'rxjs';
import { ExcludedWordsComponent } from '../excluded-words/excluded-words.component';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css'],
})
export class LayoutComponent {
  // @ts-ignore o @ts-ignore ignora o erro de inicialização do inputRef
  @ViewChild('inputRef') inputRef: ElementRef;
  @ViewChild('winnerAudio') winnerAudio!: ElementRef<HTMLAudioElement>;
  @ViewChild('errorAudio') errorAudio!: ElementRef<HTMLAudioElement>;
  squareLength = Array.from([0, 0, 0, 0, 0, 0, 0, 0]);
  category = '';
  mode = '';
  timer = 15;
  started = false;
  tm: any;
  player1 = new Player();
  player2 = new Player();
  playedLetters = '';
  playedLetter = '';
  burrinhoPlayer1: string[] = [];
  burrinhoPlayer2: string[] = [];
  burrinhoLetters = 'BURRINHO';
  showAlert: boolean = false;
  alertType: string = '';
  alertMessage: string = '';
  details: any;
  showDetails = false;
  playerName = '';
  excludedItems: object[] = [];

  constructor(public dialog: MatDialog) {}

  startGame() {
    this.hideBootstrapAlert();
    if (this.started) {
      this.clearTime();
      this.started = false;
      this.player1.isPlaying = false;
      this.player2.isPlaying = false;
    } else {
      this.restartTimer();
      this.started = true;
      this.starterPlayer();
    }
  }

  play() {
    this.playedLetters = this.player1.play(
      this.playedLetter,
      this.playedLetters
    );
    this.playedLetter = '';
    this.showDetails = false;
    this.inputRef.nativeElement.focus();
    this.restartTimer();
    if (this.player1.isPlaying) {
      this.player1.isPlaying = false;
      this.player2.isPlaying = true;
    } else if (this.player2.isPlaying) {
      this.player2.isPlaying = false;
      this.player1.isPlaying = true;
    }
  }

  onKeyUp(e: KeyboardEvent) {
    if (e.code == 'Enter' && this.playedLetter && this.started) {
      this.play();
    }
  }

  private restartTimer() {
    clearInterval(this.tm);
    this.timer = 15;
    this.tm = Timer.startTimer(15, (time) => {
      this.timer = time;
      if (this.timer == 0) {
        // Era bom que essa parte da verificacao se já atingiu a zero ou não fosse feita noutro lugar
        this.setLetter();
        if (this.burrinhoPlayer1.length >= 8) {
          this.showBootstrapAlert('success', 'Player 2 ganhou');
          this.winnerAudio.nativeElement.play();
          this.restartGame();
          this.player2.points++;
          return;
        } else if (this.burrinhoPlayer2.length >= 8) {
          this.showBootstrapAlert('success', 'Player 1 ganhou');
          this.winnerAudio.nativeElement.play();
          this.restartGame();
          this.player1.points++;
          return;
        }
        this.restartTimer();
        this.playedLetters = '';
      }
    });
  }

  private clearTime() {
    clearInterval(this.tm);
    this.timer = 15;
  }

  starterPlayer() {
    let starter = Math.round(Math.random() + 1);
    if (starter == 1) {
      this.player1.isPlaying = true;
      this.player2.isPlaying = false;
    } else {
      this.player2.isPlaying = true;
      this.player1.isPlaying = false;
    }
  }

  private setLetter() {
    if (this.player1.isPlaying) {
      let index = this.burrinhoPlayer1.length;
      this.burrinhoPlayer1.push(this.burrinhoLetters[index]);
      this.player1.isPlaying = false;
      this.player2.isPlaying = true;
      this.errorAudio.nativeElement.play();
    } else {
      let index = this.burrinhoPlayer2.length;
      this.burrinhoPlayer2.push(this.burrinhoLetters[index]);
      this.player2.isPlaying = false;
      this.player1.isPlaying = true;
      this.errorAudio.nativeElement.play();
    }
  }

  showBootstrapAlert(type: string, message: string) {
    this.alertType = type;
    this.alertMessage = message;
    this.showAlert = true;
  }

  hideBootstrapAlert() {
    this.showAlert = false;
    this.stopAndResetAudio();
  }

  restartGame() {
    this.clearTime();
    this.category = '';
    this.mode = '';
    this.started = false;
    this.burrinhoPlayer1 = [];
    this.burrinhoPlayer2 = [];
    this.playedLetter = '';
    this.playedLetters = '';
    this.player1.isPlaying = false;
    this.player2.isPlaying = false;
    this.excludedItems = [];
  }

  stopAndResetAudio() {
    const audio = this.winnerAudio.nativeElement;
    audio.pause();
    audio.currentTime = 0;
  }

  finish() {
    if (this.category == 'país' && this.mode == 'amigo') {
      if (this.player1.isPlaying) {
        this.verifyIfItemExists(paises, 'concluir');
      } else if (this.player2.isPlaying) {
        this.verifyIfItemExists(paises, 'concluir');
      }
    }
  }

  openDialog() {
     this.setPlayerName();
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '100%',
      panelClass: 'dialog-class',
      data: { playerName: this.playerName },
    });
    dialogRef.afterClosed().subscribe((remainingLetters) => {
        if (this.player1.isPlaying) {
          this.playedLetters = this.playedLetters + '' + remainingLetters;
          this.verifyIfItemExists(paises, 'interrogar');
        } else if (this.player2.isPlaying) {
          this.playedLetters = this.playedLetters + '' + remainingLetters;
          this.verifyIfItemExists(paises, 'interrogar');
        }
    });
  }

  private verifyIfItemExists(
    list: object[],
    mode: 'concluir' | 'interrogar',
  ) {
    const item = list.filter(
      (item) =>
        (item as any).nome.toLocaleLowerCase() ==
        this.playedLetters.toLocaleLowerCase() // Tirar o any daí
    );

    if (item.length >= 1 && !this.verifyIfItemExistsInExcludedItems(item[0])) {
      this.winnerAudio.nativeElement.play();
      this.restartTimer();
      this.playedLetters = '';
      this.details = item[0];
      this.showDetails = true;
      if (mode == 'interrogar') {
        this.setLetter();
        this.restartTimer();
        this.playedLetters = '';
      }
      this.excludedItems.push(item[0]);
    } else {
      if (mode == 'interrogar') {
        this.player1.isPlaying = !this.player1.isPlaying;
        this.player2.isPlaying = !this.player2.isPlaying;
      }
      this.setLetter();
      this.errorAudio.nativeElement.play();
      this.restartTimer(); // Ao restartar o timer vou parar esse audio de cima
      this.playedLetters = '';
    }
  }

  private verifyIfItemExistsInExcludedItems(selectedItem: object) {
    if(!selectedItem) {
      return false;
    }
    const index = this.excludedItems.findIndex((item) => (item as any).nome == (selectedItem as any).nome) // Tirar os any
    return index > -1 ? true : false;
  }

  private setPlayerName() {
    this.player1.isPlaying
      ? (this.playerName = 'J2')
      : (this.playerName = 'J1');
  }

  openExcludedWordsDialog(): void {
    this.excludedItems.sort((a, b) => {
      if ((a as any).nome < (b as any).nome) { // Tirar os any
        return -1;
      }
      if ((a as any).nome > (b as any).nome) {
        return 1;
      }
      return 0;
    });

    this.dialog.open(ExcludedWordsComponent, {
      width: '500px',
      autoFocus: false,
      data: { excludedWords: this.excludedItems }
    });
  }
}
//Criar as instruçoes, Fazer a parte do pc, refatorar, testar, publicar na vercel. Consumir api de paises e de jogadores, ver o bug que está a dar no console..
