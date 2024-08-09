import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ReactionService {
  moreBtn: boolean = false;

  constructor() { }

  closeMoreBtn() {
    this.moreBtn = false;
  }
}
