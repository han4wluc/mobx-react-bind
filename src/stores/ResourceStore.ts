import { action, observable, computed } from 'mobx';

class ResourceStore<T> {
  constructor(
    items: T[] = [],
    idExtractor: (item: T) => any = (x): any => x,
    selectedId?: any,
  ) {
    this.items = items;
    this.idExtractor = idExtractor;
    this.selectedId = selectedId;
  }

  private idExtractor: (item: T) => boolean;

  @observable items: T[];
  @observable selectedId?: any;

  @computed get selectedItem(): any {
    if (this.selectedId === undefined) {
      return undefined;
    }
    const selectedItem = this.items.filter(
      e => this.idExtractor(e) === this.selectedId,
    )[0];
    return selectedItem;
  }

  @action append(item: T, allowDuplicate: boolean = false): void {
    if (allowDuplicate) {
      this.items.push(item);
      return;
    }
    const index = this.items
      .map(this.idExtractor)
      .indexOf(this.idExtractor(item));
    if (index === -1) {
      this.items.push(item);
      return;
    }
    this.items[index] = item;
  }

  @action appendMultiple(items: T[], allowDuplicate: boolean = false): void {
    if (allowDuplicate) {
      this.items = this.items.concat(items);
      return;
    }
    items.forEach(item => {
      this.append(item, allowDuplicate);
    });
  }

  @action replace(items: T[]): void {
    this.items = items;
  }

  @action remove(id: any): void {
    this.items = this.items.filter(x => this.idExtractor(x) !== id);
  }

  @action setSelectedId(id: any): void {
    this.selectedId = id;
  }

  @action removeSelectedId(): void {
    this.selectedId = undefined;
  }
}

export default ResourceStore;
