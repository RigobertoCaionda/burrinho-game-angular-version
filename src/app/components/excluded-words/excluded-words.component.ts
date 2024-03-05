import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-excluded-words',
  templateUrl: './excluded-words.component.html',
  styleUrls: ['./excluded-words.component.css'],
})
export class ExcludedWordsComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { excludedWords: object[] }
  ) {}
}
