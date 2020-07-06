import React from "react";
import { observable, action, computed } from "mobx";
import { assert } from "chai";
import sinon from "sinon";
import * as TestRenderer from "react-test-renderer";
import { Injectable } from "injection-js";
import mobxReactBind, {
  addCommonProviders,
  resetInjector,
  getInjector,
} from "../src/mobxReactBind";
import ResourcesStore from "../src/stores/ResourceStore";

const sleep = async (time = 1) => {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
};

describe("mobxReactBind", () => {
  describe("basic features", () => {
    let testComponent;
    let CounterComponent;

    beforeEach(() => {
      resetInjector();
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
        return (
          <div
            onClick={container.increment}
          >{`${prefix}${container.count}`}</div>
        );
      }

      CounterComponent = mobxReactBind({
        container: CounterContainer,
      })(CounterView);
    });

    afterEach(() => {
      resetInjector();
    });

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

  describe("addCommonProviders", () => {
    let testComponent;
    let CounterComponent;

    beforeEach(() => {
      @Injectable()
      class UserStore {
        @observable name = "old name";

        @action
        setName(name: string) {
          this.name = name;
        }
      }

      @Injectable()
      class CounterContainer {
        constructor(private userStore: UserStore) {}

        @computed
        get prefix() {
          return this.userStore.name;
        }

        @observable
        count = 0;
      }

      function CounterView(props) {
        const { container } = props;
        return <div>{`${container.prefix}-${container.count}`}</div>;
      }

      addCommonProviders([UserStore]);

      CounterComponent = mobxReactBind({
        container: CounterContainer,
      })(CounterView);
    });

    afterEach(() => {
      resetInjector();
    });

    it("should render correct store values", () => {
      testComponent = TestRenderer.create(<CounterComponent />);
      assert.deepEqual(testComponent.toJSON().children, ["old name-0"]);
      testComponent.unmount();
    });
  });

  describe("state", () => {
    let testComponent;
    let testComponent2;
    let testComponent3;

    let CounterComponent;
    let Counter2Component;

    beforeEach(() => {
      resetInjector();

      @Injectable()
      class UserStore {
        @observable name = "old name";

        @action
        setName(name: string) {
          this.name = name;
        }
      }

      @Injectable()
      class CounterContainer {
        constructor(private userStore: UserStore) {}

        @computed
        get prefix() {
          return this.userStore.name;
        }

        @observable
        count = 0;

        @action
        incrementAndSetName = () => {
          this.count = this.count + 1;
          this.userStore.setName("new name");
        };
      }

      @Injectable()
      class Counter2Container {
        constructor(private userStore: UserStore) {}

        @computed
        get prefix() {
          return this.userStore.name;
        }

        @observable
        count = 0;

        @action
        incrementAndSetName = () => {
          this.count = this.count + 1;
          this.userStore.setName("new name");
        };
      }

      function CounterView(props) {
        const { container } = props;
        return (
          <div
            onClick={container.incrementAndSetName}
          >{`${container.prefix}-${container.count}`}</div>
        );
      }

      CounterComponent = mobxReactBind({
        container: CounterContainer,
        providers: [UserStore],
      })(CounterView);

      Counter2Component = mobxReactBind({
        container: Counter2Container,
        providers: [UserStore],
      })(CounterView);
    });

    afterEach(() => {
      resetInjector();
    });

    it("should reset container state, but keep store state", () => {
      testComponent = TestRenderer.create(<CounterComponent />);
      testComponent3 = TestRenderer.create(<Counter2Component />);

      assert.deepEqual(testComponent.toJSON().children, ["old name-0"]);
      assert.deepEqual(testComponent3.toJSON().children, ["old name-0"]);

      TestRenderer.act(() => {
        testComponent.root.findByType("div").props.onClick();
      });
      assert.deepEqual(testComponent.toJSON().children, ["new name-1"]);
      assert.deepEqual(testComponent3.toJSON().children, ["new name-0"]);
      testComponent.unmount();

      testComponent2 = TestRenderer.create(<CounterComponent />);
      assert.deepEqual(testComponent2.toJSON().children, ["new name-0"]);
      assert.deepEqual(testComponent3.toJSON().children, ["new name-0"]);
    });
  });

  describe("component mount, unmount", () => {
    let testComponent;
    let mountSpy = sinon.spy();
    let unmountSpy = sinon.spy();
    let CounterComponent;

    beforeEach(() => {
      mountSpy.resetHistory();
      unmountSpy.resetHistory();
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

      CounterComponent = mobxReactBind({
        container: CounterContainer,
        providers: [MountService],
      })(CounterView);
    });

    afterEach(() => {
      mountSpy.resetHistory();
      unmountSpy.resetHistory();
      resetInjector();
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
    let CounterComponent;

    beforeEach(() => {
      resetInjector();
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

      CounterComponent = mobxReactBind({
        container: CounterContainer,
      })(CounterView);
    });

    afterEach(() => {
      resetInjector();
    });

    it("should render correct store values", () => {
      testComponent = TestRenderer.create(<CounterComponent />);
      assert.deepEqual(testComponent.toJSON().children, ["Ok"]);
      testComponent.unmount();
    });
  });

  describe('add', () => {

    beforeEach(() => {
      resetInjector()
    })

    it.only('should do it', () => {

      @Injectable()
      class Engine1 {}

      @Injectable()
      class Car1 {private engine: Engine1}

      @Injectable()
      class Car2 {private engine: Engine1}

      assert.equal(getInjector()['keyIds'].length, 0)

      addCommonProviders([Engine1])

      assert.equal(getInjector()['keyIds'].length, 1)
      addCommonProviders([Engine1])

      assert.equal(getInjector()['keyIds'].length, 1)

      function Component() {
        return <div>ok</div>
      }

      mobxReactBind({
        container: Car1,
        providers: [Engine1]
      })(Component);

      mobxReactBind({
        container: Car2,
        providers: [Engine1]
      })(Component);

      assert.equal(getInjector()['keyIds'].length, 1)
    })
  })
});
