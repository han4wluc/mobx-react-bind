import { assert } from "chai";
import "reflect-metadata";
import { Injectable, Injector, ReflectiveInjector } from "injection-js";
import "mobx-react-lite/batchingForReactDom";

@Injectable()
class Engine {
  get name() {
    return "hello";
  }
}

@Injectable()
class Car {
  constructor(public engine: Engine) {}
  get engineName() {
    return this.engine.name;
  }
}

describe("Injectable", () => {
  it("basic features", () => {
    function getDi({ Store, providers = [] }) {
      var injector = ReflectiveInjector.resolveAndCreate(
        providers.concat(Injectable()(Store))
      );
      return injector.get(Store);
    }
    const car = getDi({
      Store: Car,
      providers: [Engine],
    });
    assert.isTrue(car instanceof Car);
    assert.equal(car.engineName, "hello");
  });
});
