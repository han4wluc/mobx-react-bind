
import React from 'react';
import { observable, action } from 'mobx'
import { assert } from 'chai'
import sinon from 'sinon'
import * as TestRenderer from 'react-test-renderer';
import 'mobx-react-lite/batchingForReactDom'

import mobxReactBind from '../src/mobxReactBind';

const sleep = async (time = 1) => {
  return new Promise((resolve) => {
    setTimeout(resolve, time)
  })
}

describe('mobxReactBind', () => {

  describe('basic features', () => {
    let testComponent;
    let doSomethingSpy = sinon.spy()
    let mountSpy = sinon.spy()
    let unmountSpy = sinon.spy()
  
    class CounterStore {
      onMount
      onUnmount
    
      constructor(protected dependecies) {
        dependecies.doSomething()
        this.onMount = dependecies.onMount
        this.onUnmount = dependecies.onUnmount
      }
    
      @observable
      count = 0
    
      @action
      increment = () => {
        this.count = this.count + 1
      }
    
      mount = () => {
        this.onMount()
        return () => {
          this.onUnmount()
        }
      }
    }
    
    function CounterView(props) {
      const { store, prefix = '' } = props
      return (
        <div onClick={store.increment}>{`${prefix}${store.count}`}</div>
      )
    }
  
    const CounterComponent = mobxReactBind({
      Store: CounterStore,
      dependencies: {
        doSomething: doSomethingSpy,
        onMount: mountSpy,
        onUnmount: unmountSpy
      }
    })(CounterView)
  
    beforeEach(() => {
      doSomethingSpy.resetHistory()
      mountSpy.resetHistory()
      unmountSpy.resetHistory()
    })
  
    afterEach(() => {
      doSomethingSpy.resetHistory()
      mountSpy.resetHistory()
      unmountSpy.resetHistory()
    })
  
    it('should render correct store values', () => {
      testComponent = TestRenderer.create(<CounterComponent/>)
      assert.deepEqual(testComponent.toJSON().children, ['0'])
      testComponent.unmount()
    })
  
    it('should update store values', async () => {
      testComponent = TestRenderer.create(<CounterComponent/>)
      testComponent.root.findByType('div').props.onClick();
      await sleep()
      assert.deepEqual(testComponent.toJSON().children, ['1'])
      testComponent.unmount()
    })
  
    it('should not break props', async () => {
      testComponent = TestRenderer.create(<CounterComponent prefix="counter is "/>)
      assert.deepEqual(testComponent.toJSON().children, ['counter is 0'])
    })
  
    it('should pass correct dependencies', () => {
      testComponent = TestRenderer.create(<CounterComponent/>)
      assert.isTrue(doSomethingSpy.calledOnce)
    })
  
    it('should mount correctly', async () => {
      // reset spies, otherwise sometimes mount is called twice
      await sleep()
      mountSpy.resetHistory()
      TestRenderer.act(() => {
        testComponent = TestRenderer.create(<CounterComponent/>)
      })
      assert.equal(mountSpy.callCount, 1)
    })
  
    it('should unmount correctly', async () => {
      testComponent = TestRenderer.create(<CounterComponent/>)
      testComponent.unmount()
      await sleep()
      assert.isTrue(unmountSpy.calledOnce)
    })
  })

  describe('handle props', () => {
    let testComponent;
    let constructorSpy = sinon.spy()
    let updateSpy = sinon.spy()

    class CounterStore {

      constructor(protected dependecies, props) {
        constructorSpy(props.count)
      }

      onUpdateProps = (nextProps) => {
        updateSpy(nextProps.count)
      }
    }

    function CounterView(props) {
      return (
        <div>x</div>
      )
    }
  
    const CounterComponent = mobxReactBind({
      Store: CounterStore,
    })(CounterView)


    beforeEach(() => {
      constructorSpy.resetHistory()
      updateSpy.resetHistory()
    })

    afterEach(() => {
      constructorSpy.resetHistory()
      updateSpy.resetHistory()
    })

    it('should receive props in constructor', () => {
      TestRenderer.act(() => {
        testComponent = TestRenderer.create(<CounterComponent/>)
      })
      assert.isTrue(constructorSpy.calledOnceWith(undefined))
    })

    it('should receive props in constructor only once', () => {
      TestRenderer.act(() => {
        testComponent = TestRenderer.create(<CounterComponent count={1}/>)
      })
      assert.isTrue(constructorSpy.calledOnceWith(1))
      TestRenderer.act(() => {
        testComponent.update(<CounterComponent count={2}/>)
      })
      assert.equal(constructorSpy.callCount, 1)
      assert.isTrue(constructorSpy.calledOnceWith(1))
    })

    it('should call onPropsDidUpdate', () => {
      TestRenderer.act(() => {
        testComponent = TestRenderer.create(<CounterComponent count={1}/>)
      })
      TestRenderer.act(() => {
        testComponent.update(<CounterComponent count={2}/>)
      })
      assert.isTrue(updateSpy.calledOnceWith(2))
    })
  })

})
