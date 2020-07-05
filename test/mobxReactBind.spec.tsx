import React from "react";
import { observable, action, computed } from "mobx";
import { assert } from "chai";
import sinon from "sinon";
import * as TestRenderer from "react-test-renderer";
import { Injectable } from "injection-js";
import mobxReactBind from "../src/mobxReactBind";
import ResourcesStore from "../src/stores/ResourceStore";

const sleep = async (time = 1) => {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
};

describe("mobxReactBind", () => {
  describe("basic features", () => {
    let testComponent;

    @Injectable()
    class CounterContainer {
      constructor() {}

      @observable
      count = 0;

      @action
      increment = () => {
        this.count = this.count + 1;
      };
    }

    function CounterView(props) {
      const { container, prefix = "" } = props;
      return <div onClick={container.increment}>{`${prefix}${container.count}`}</div>;
    }

    const CounterComponent = mobxReactBind({
      container: CounterContainer,
    })(CounterView);

    it("should render correct store values", () => {
      testComponent = TestRenderer.create(<CounterComponent />);
      assert.deepEqual(testComponent.toJSON().children, ["0"]);
      testComponent.unmount();
    });

    it("should update store values", async () => {
      testComponent = TestRenderer.create(<CounterComponent />);
      TestRenderer.act(() => {
        testComponent.root.findByType("div").props.onClick();
      });
      assert.deepEqual(testComponent.toJSON().children, ["1"]);
      testComponent.unmount();
    });

    it("should not break props", async () => {
      testComponent = TestRenderer.create(
        <CounterComponent prefix="counter is " />
      );
      assert.deepEqual(testComponent.toJSON().children, ["counter is 0"]);
    });
  });

  describe('state', () => {
    let testComponent;
    let testComponent2;

    @Injectable()
    class UserStore {

      @observable name = 'old name'

      @action
      setName(name: string) {
        console.warn('setName', name)
        this.name = name;
      }
    }

    @Injectable()
    class CounterContainer {
      constructor(private userStore: UserStore) {

      }

      @computed
      get prefix() {
        console.warn('prefix', this.userStore.name)
        return this.userStore.name
      }

      @observable
      count = 0;

      @action
      incrementAndSetName = () => {
        this.count = this.count + 1;
        this.userStore.setName('new name')
      };
    }

    function CounterView(props) {
      const { container } = props;
      return <div onClick={container.incrementAndSetName}>{`${container.prefix}-${container.count}`}</div>;
    }

    const CounterComponent = mobxReactBind({
      container: CounterContainer,
      providers: [UserStore]
    })(CounterView);

    it('should reset container state, but keep store state', () => {
      testComponent = TestRenderer.create(<CounterComponent />);
      TestRenderer.act(() => {
        testComponent.root.findByType("div").props.onClick();
      });
      assert.deepEqual(testComponent.toJSON().children, ["new name-1"]);
      testComponent.unmount();

      testComponent2 = TestRenderer.create(<CounterComponent />);
      assert.deepEqual(testComponent2.toJSON().children, ["new name-0"]);
    })
  })

  describe("component mount, unmount", () => {
    let testComponent;
    let mountSpy = sinon.spy();
    let unmountSpy = sinon.spy();

    @Injectable()
    class MountService {
      onMount = mountSpy;
      onUmount = unmountSpy;
    }

    @Injectable()
    class CounterContainer {
      constructor(private mountService: MountService) {}

      mount = () => {
        this.mountService.onMount();
        return () => {
          this.mountService.onUmount();
        };
      };
    }

    function CounterView(props) {
      return <div>Ok</div>;
    }

    const CounterComponent = mobxReactBind({
      container: CounterContainer,
      providers: [MountService],
    })(CounterView);

    beforeEach(() => {
      mountSpy.resetHistory();
      unmountSpy.resetHistory();
    });

    afterEach(() => {
      mountSpy.resetHistory();
      unmountSpy.resetHistory();
    });

    it("should mount correctly", async () => {
      // reset spies, otherwise sometimes mount is called twice
      await sleep();
      mountSpy.resetHistory();
      TestRenderer.act(() => {
        testComponent = TestRenderer.create(<CounterComponent />);
      });
      assert.equal(mountSpy.callCount, 1);
    });

    it("should unmount correctly", async () => {
      testComponent = TestRenderer.create(<CounterComponent />);
      testComponent.unmount();
      await sleep();
      assert.isTrue(unmountSpy.calledOnce);
    });
  });

  describe("initialize non injectable classes", () => {
    let testComponent;
    @Injectable()
    class CounterContainer {
      resourcesStore;
      constructor() {
        this.resourcesStore = new ResourcesStore<any>();
      }
    }

    function CounterView(props) {
      return <div>Ok</div>;
    }

    const CounterComponent = mobxReactBind({
      container: CounterContainer,
    })(CounterView);

    it("should render correct store values", () => {
      testComponent = TestRenderer.create(<CounterComponent />);
      assert.deepEqual(testComponent.toJSON().children, ["Ok"]);
      testComponent.unmount();
    });
  });
});
