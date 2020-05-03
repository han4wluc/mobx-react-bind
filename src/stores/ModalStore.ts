import { action, observable } from 'mobx';

class ModalStore<T> {
  constructor(visible: boolean = false, payload?: T) {
    this.visible = visible;
    this.payload = payload;
  }

  @observable visible: boolean = false;
  @observable payload: T | undefined;

  @action show(payload?: T): void {
    this.visible = true;
    this.payload = payload;
  }

  @action hide(delay = 500): void {
    this.visible = false;
    setTimeout(() => {
      this.payload = undefined;
    }, delay);
  }
}

export default ModalStore;
