import { Component, ElementRef, ViewChild } from '@angular/core';
import { Player } from 'src/app/utils/Player';
import { Timer } from 'src/app/utils/Timer';
import { paises } from 'src/app/utils/Players';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from '../dialog/dialog.component';
import { ExcludedWordsComponent } from '../excluded-words/excluded-words.component';
import { BehaviorSubject, Subscription } from 'rxjs';

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
  pcIsOnMatch = false;

  singers = [];
  player2Name = 'J2';
  private isPlayingChangedSubscription!: Subscription;
  timerSubject: BehaviorSubject<number> = new BehaviorSubject<number>(
    this.timer
  );
  private timerChangedSubscription!: Subscription;
  dialogOpen: boolean = false;
  dialogRef: any;
  automaticClick = false;

  constructor(public dialog: MatDialog) {}

  ngOnInit() {
    this.subscribeTimerChanges();
  }

  startGame() {
    this.hideBootstrapAlert();
    if (this.started) {
      this.clearTime();
      this.started = false;
      this.player1.setPlayingStatus(false);
      this.player2.setPlayingStatus(false);
    } else {
      this.resetDetails();
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
    this.revertPlayer();
  }

  onKeyUp(e: KeyboardEvent) {
    if (e.code == 'Enter' && this.playedLetter && this.started) {
      this.play();
    }
  }

  private restartTimer() {
    clearInterval(this.tm);
    this.timer = 15;
    if (this.burrinhoPlayer1.length >= 8 || this.burrinhoPlayer2.length >= 8) {
      clearInterval(this.tm);
    } else {
      this.tm = Timer.startTimer(15, (time) => {
        this.timer = time;
        this.timerSubject.next(time);
      });
    }
  }

  private clearTime() {
    clearInterval(this.tm);
    this.timer = 15;
  }

  starterPlayer() {
    let starter = Math.round(Math.random() + 1);
    if (starter == 1) {
      this.player1.setPlayingStatus(true);
      this.player2.setPlayingStatus(false);
    } else {
      this.player2.setPlayingStatus(true);
      this.player1.setPlayingStatus(false);
    }
  }

  private setLetter() {
    if (this.player1.isPlaying) {
      let index = this.burrinhoPlayer1.length;
      this.burrinhoPlayer1.push(this.burrinhoLetters[index]);
      this.revertPlayer();
      this.errorAudio.nativeElement.play();
    } else {
      let index = this.burrinhoPlayer2.length;
      this.burrinhoPlayer2.push(this.burrinhoLetters[index]);
      this.revertPlayer();
      this.errorAudio.nativeElement.play();
    }
    this.playedLetters = '';
    this.restartTimer();
    this.verifyIfGameIsEnded();
  }

  private verifyIfGameIsEnded() {
    if (this.burrinhoPlayer1.length >= 8) {
      this.showBootstrapAlert('success', 'Player 2 ganhou');
      this.winnerAudio.nativeElement.play();
      this.restartGame();
      this.player2.points++;
      this.playedLetters = '';
      return;
    } else if (this.burrinhoPlayer2.length >= 8) {
      this.showBootstrapAlert('success', 'Player 1 ganhou');
      this.winnerAudio.nativeElement.play();
      this.restartGame();
      this.player1.points++;
      this.playedLetters = '';
      return;
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
    this.player1.setPlayingStatus(false);
    this.player2.setPlayingStatus(false);
    this.excludedItems = [];
  }

  stopAndResetAudio() {
    const audio = this.winnerAudio.nativeElement;
    audio.pause();
    audio.currentTime = 0;
  }

  finish() {
    switch (this.category) {
      case 'país':
        this.verifyIfItemExists(paises, 'concluir');
        break;
      case 'cantor':
        this.verifyIfItemExists(this.singers, 'concluir');
        break;
      case 'jogador':
        // Faça alguma coisa
        break;
      default:
        console.log('categoria inválida');
    }
  }

  openDialog() {
    this.restartTimer();
    this.setPlayerName();
    this.dialogOpen = true;
    if (this.mode == 'computador' && !this.player2.isPlaying) {
      const list = this.getExcludedWordsFromCategory();
      const items: any = list?.filter((item) => {
        return (item as any).nome
          .toLocaleLowerCase()
          .startsWith(this.playedLetters.toLocaleLowerCase());
      });

      const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');
      const baseList = [];
      let newWord = '';
      items[0]?.nome ? (newWord = items[0]?.nome) : (newWord = '');
      let lastLetter = '';
      items[0]?.nome
        ? (lastLetter = newWord[newWord?.length - 1])
        : (lastLetter = '');
      for (let i = 0; i <= 3; i++) {
        baseList.push(lastLetter);
      }
      for (let i = 0; i <= 1; i++) {
        let alphabetLetterIndex = Math.floor(Math.random() * alphabet.length);
        baseList.push(alphabet[alphabetLetterIndex]);
      }
      let randomMoveIndex = Math.floor(Math.random() * (baseList.length - 1));
      newWord = newWord.slice(0, -1) + baseList[randomMoveIndex];
      this.playedLetters = newWord;
      this.inputRef.nativeElement.focus();
      this.verifyIfItemExists(paises, 'interrogar');
      return;
    }
    this.dialogRef = this.dialog.open(DialogComponent, {
      width: '100%',
      panelClass: 'dialog-class',
      data: { playerName: this.playerName },
    });
    this.automaticClick = false;
    this.dialogRef.afterClosed().subscribe((remainingLetters: string) => {
      this.dialogOpen = false;
      this.playedLetters = this.playedLetters + '' + remainingLetters;
      if (!this.automaticClick) {
        this.getCategoryForInterrogation();
      }
      this.playedLetters = '';
    });
  }

  private getExcludedWordsFromCategory() {
    let list;
    switch (this.category) {
      case 'país':
        list = this.excludeDeletedItemsFromList(paises);
        break;
      case 'jogadores futebol':
        break;
      case 'cantor':
        list = this.excludeDeletedItemsFromList(this.singers);
        break;
    }
    return list;
  }

  private getCategoryForInterrogation() {
    switch (this.category) {
      case 'país':
        this.verifyIfItemExists(paises, 'interrogar');
        break;
      case 'jogadores futebol':
        break;
      case 'cantor':
        this.verifyIfItemExists(this.singers, 'interrogar');
        break;
    }
  }

  private verifyIfItemExists(list: object[], mode: 'concluir' | 'interrogar') {
    const item = list.filter(
      (item) =>
        (item as any).nome.toLocaleLowerCase() ==
        this.playedLetters.toLocaleLowerCase()
    );
    if (item.length >= 1 && !this.verifyIfItemExistsInExcludedItems(item[0])) {
      this.winnerAudio.nativeElement.play();
      this.playedLetters = '';
      this.details = item[0];
      this.showDetails = true;
      if (mode == 'interrogar') {
        this.setLetter();
        this.playedLetters = '';
      }
      this.excludedItems.push(item[0]);
    } else {
      if (mode == 'interrogar' && this.mode == 'computador') {
        this.unSubscribeToPlayer2Changes();
       this.revertPlayer();
        this.subscribeToPlayer2Changes();
      }
      this.revertPlayer();
      this.setLetter();
      this.errorAudio.nativeElement.play();
      this.playedLetters = '';
    }
    this.restartTimer();
  }

  private verifyIfItemExistsInExcludedItems(selectedItem: object) {
    if (!selectedItem) {
      return false;
    }
    const index = this.excludedItems.findIndex(
      (item) => (item as any).nome == (selectedItem as any).nome
    );
    return index > -1 ? true : false;
  }

  private excludeDeletedItemsFromList(list: object[]) {
    const newList = list.filter(
      (item1) =>
        !this.excludedItems.some(
          (item2) => (item2 as any).nome === (item1 as any).nome
        )
    );
    return newList;
  }

  private setPlayerName() {
    this.player1.isPlaying
      ? (this.playerName = 'J2')
      : (this.playerName = 'J1');
  }

  openExcludedWordsDialog(): void {
    this.excludedItems.sort((a, b) => {
      if ((a as any).nome < (b as any).nome) {
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
      data: { excludedWords: this.excludedItems },
    });
  }
  computerPlays(list: object[]) {
    const items: any = list.filter((item) => {
      return (item as any).nome
        .toLocaleLowerCase()
        .startsWith(this.playedLetters.toLocaleLowerCase());
    });
    const nextLetterIndex = this.playedLetters.length;
    if (items.length > 0) {
      if (items[0].nome[nextLetterIndex] !== undefined) {
        const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');
        const baseList = [];
        for (let i = 0; i <= 3; i++) {
          baseList.push(items[0].nome[nextLetterIndex]);
        }
        for (let i = 0; i <= 1; i++) {
          let alphabetLetterIndex = Math.floor(Math.random() * alphabet.length);
          baseList.push(alphabet[alphabetLetterIndex]);
        }
        let randomMoveIndex = Math.floor(Math.random() * (baseList.length - 1));
        this.playedLetters = this.player2.play(
          baseList[randomMoveIndex],
          this.playedLetters
        );
      } else {
        this.finish();
        this.revertPlayer();
        return;
      }
      this.playedLetter = '';
      this.showDetails = false;
      this.inputRef.nativeElement.focus();
      this.restartTimer();
      this.revertPlayer();
    } else {
      let index = Math.floor(Math.random() * 6);
      if (index == 1 || index == 2) {
        const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');
        let alphabetLetterIndex = Math.floor(Math.random() * alphabet.length);
        this.playedLetters = this.player2.play(
          alphabet[alphabetLetterIndex],
          this.playedLetters
        );
        this.revertPlayer();
      } else {
        this.openDialog();
      }
    }
  }

  private revertPlayer() {
    if (this.player1.isPlaying) {
      this.player1.setPlayingStatus(false);
      this.player2.setPlayingStatus(true);
    } else if (this.player2.isPlaying) {
      this.player2.setPlayingStatus(false);
      this.player1.setPlayingStatus(true);
    }
  }

  private resetDetails() {
    this.showDetails = false;
    this.playedLetter = '';
    this.playedLetters = '';
    this.excludedItems = [];
    this.burrinhoPlayer1 = [];
    this.burrinhoPlayer2 = [];
  }

  onModeChange() {
    if (this.mode == 'computador') {
      this.pcIsOnMatch = true;
      this.unSubscribeToPlayer2Changes();
      this.subscribeToPlayer2Changes();
    } else {
      this.pcIsOnMatch = false;
      this.unSubscribeToPlayer2Changes();
    }
  }

  private unSubscribeToPlayer2Changes() {
    if (this.isPlayingChangedSubscription) {
      this.isPlayingChangedSubscription.unsubscribe();
    }
  }
  private subscribeTimerChanges() {
    this.timerChangedSubscription = this.timerSubject.subscribe((time) => {
      if (time == 0) {
        if (this.dialogOpen) {
          this.revertPlayer();
          this.automaticClick = true;
          this.closeDialog();
          this.setLetter();
          if (this.player1.isPlaying) {
            this.burrinhoPlayer1.pop();
          }
          if (this.player2.isPlaying) {
            this.burrinhoPlayer2.pop();
          }
        } else {
          this.setLetter();
        }
      }
    });
  }
  private subscribeToPlayer2Changes() {
    let previousIsPlaying = this.player2.isPlaying;
    this.isPlayingChangedSubscription = this.player2.isPlayingChanged.subscribe(
      (isPlaying) => {
        if (previousIsPlaying !== isPlaying && isPlaying) {
          setTimeout(() => {
            switch (this.category) {
              case 'país':
                const countries = this.excludeDeletedItemsFromList(paises);
                this.computerPlays(countries);
                break;
              case 'cantor':
                const singers = this.excludeDeletedItemsFromList(this.singers);
                this.computerPlays(singers);
                break;
              case 'jogador':
                break;
            }
          }, 2000);
        }
        previousIsPlaying = isPlaying;
      }
    );
  }
  closeDialog() {
    if (this.dialogRef) {
      this.dialogRef.close();
    }
  }
  ngOnDestroy() {
    if (this.timerChangedSubscription) {
      this.timerChangedSubscription.unsubscribe();
    }
  }
}
