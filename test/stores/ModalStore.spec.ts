import { assert } from 'chai';
import ModalStore from '../../src/stores/ModalStore';

const sleep =  (timeout = 500) => {
  return new Promise((resolve) => {
    setTimeout(resolve, timeout)
  })
} 

describe('ModalStore', () => {
  describe('ModalStore#constructor', () => {
    it('should initiate with empty values', () => {
      const store = new ModalStore();
      assert.equal(store.visible, false);
      assert.equal(store.payload, undefined);
    });

    it('should initiate with passed value', () => {
      const store = new ModalStore(true, 'payload')
      assert.equal(store.visible, true)
      assert.equal(store.payload, 'payload')
    });
  });

  describe('ModalStore#show', () => {
    it('set visible to true', () => {
      const store = new ModalStore();
      store.show();
      assert.equal(store.visible, true);
      assert.equal(store.payload, undefined);
    });

    it('set visible to true and set payload', () => {
      const store = new ModalStore();
      store.show('payload')
      assert.equal(store.visible, true);
      assert.equal(store.payload, 'payload');
    });
  });

  describe('ModalStore#hide', () => {
    it('set visible to false and eventually clear payload', async () => {
      const store = new ModalStore(true, 'payload');
      store.hide(1)
      assert.equal(store.visible, false);
      assert.equal(store.payload, 'payload')
      await sleep(5);
      assert.equal(store.payload, undefined);
    });
  });
});
