import EventBus from '../events/EventBus';

export class EconomyManager {
  private _coins: number = 0;
  private _day: number = 1;

  get coins(): number { return this._coins; }
  get day(): number { return this._day; }

  addCoins(amount: number, source: string): void {
    this._coins += amount;
    EventBus.emit('economy:changed', { coins: this._coins, day: this._day, source });
  }

  spendCoins(amount: number): boolean {
    if (this._coins < amount) return false;
    this._coins -= amount;
    EventBus.emit('economy:changed', { coins: this._coins, day: this._day, source: 'spend' });
    return true;
  }

  setDay(day: number): void {
    this._day = day;
    EventBus.emit('economy:changed', { coins: this._coins, day: this._day, source: 'day-change' });
  }

  /** Reset economy state (for scene restart) */
  reset(): void {
    this._coins = 0;
    this._day = 1;
  }
}
