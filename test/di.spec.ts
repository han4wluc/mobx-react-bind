import "reflect-metadata";
import { assert } from "chai";
import { Injectable, ReflectiveInjector , ResolvedReflectiveProvider} from "injection-js";

@Injectable()
class Engine {
  get name() {
    return "hello";
  }
}

@Injectable()
class Car {
  count: number;
  constructor(private  engine: Engine) {
    this.count = 0;
  }
  get engineName() {
    return this.engine.name + ' ' + this.count;
  }
  increment = () => {
    this.count ++;
  }
}

describe("Injectable", () => {
  it("basic features", () => {
    let injector = ReflectiveInjector.resolveAndCreate([])

    injector['add'] = function (_providers: ResolvedReflectiveProvider[]) {
      _providers.forEach((provider) => {
        if (this.keyIds.includes(provider.key.id)) {
          return
        }
        this.keyIds.push(provider.key.id)
        this.objs.push(this._new(provider))
      })
    }

    function getDi({ container, providers = [] }) {
      const resolvedProviders = ReflectiveInjector.resolve(providers.concat(container))
      injector['add'](resolvedProviders)
      return injector.get(container);
    }
    const car = getDi({
      container: Car,
      providers: [Engine],
    });
    assert.isTrue(car instanceof Car);
    assert.equal(car.engineName, "hello 0");
    car.increment()
    assert.equal(car.engineName, 'hello 1')


    const car2 = getDi({
      container: Car,
      providers: [Engine],
    });

    assert.equal(car2.engineName, 'hello 1')
  });
});
