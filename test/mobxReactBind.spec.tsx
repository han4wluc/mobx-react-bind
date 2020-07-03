import React from "react";
import { observable, action } from "mobx";
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
    class CounterStore {
      constructor() {}

      @observable
      count = 0;

      @action
      increment = () => {
        this.count = this.count + 1;
      };
    }

    function CounterView(props) {
      const { store, prefix = "" } = props;
      return <div onClick={store.increment}>{`${prefix}${store.count}`}</div>;
    }

    const CounterComponent = mobxReactBind({
      Store: CounterStore,
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
    class CounterStore {
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
      Store: CounterStore,
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
    class CounterStore {
      resourcesStore;
      constructor() {
        this.resourcesStore = new ResourcesStore<any>();
      }
    }

    function CounterView(props) {
      return <div>Ok</div>;
    }

    const CounterComponent = mobxReactBind({
      Store: CounterStore,
    })(CounterView);

    it("should render correct store values", () => {
      testComponent = TestRenderer.create(<CounterComponent />);
      assert.deepEqual(testComponent.toJSON().children, ["Ok"]);
      testComponent.unmount();
    });
  });
});
