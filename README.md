
# Installation

`npm install mobx-react-bind`

or

`yarn add mobx-react-bind`

# Usage

## Basic Usage

Define a mobx store
```jsx
import { observable, action } from 'mobx'

class CounterStore {
  @observable
  count = 0

  @action
  increment = () => {
    this.count = this.count + 1
  }
}
```

Define a react stateless component

```jsx
function CounterView(props) {
  const { store } = props
  return (
    <div onClick={store.increment}>{store.count}</div>
  )
}
```

Bind mobx store and react view

```jsx
import mobxReactBind from 'mobx-react-bind'

const CounterComponent = mobxReactBind({
  Store: CounterStore,
})(CounterView)


// You can then just use it as a usual react component
<CounterComponent />

```

## React lifecycle methods

In the mobx store, you can add a `mount` method that will be called when the component is mounted.

It also accepts a function as a return value that will be called when the component is unmounted.

```jsx
class CounterStore {
  
  mount = () => {
    console.log('mount')
    return () => {
      console.log('unmount')
    }
  }
}
```

## Passing dependencies to the store

You can pass additional dependencies into the mobx store constructor.
This is a very basic depencency injection that can make testing easier.

```jsx
class CounterStore {
  handleClick: Function;

  constructor(dependencies) {
    this.handleClick = dependencies.handleClick;
  }
}

const CounterComponent = mobxReactBind({
  Store: CounterStore,
  dependencies: {
    handleClick: () => { console.log('handle click') }
  }
})(CounterView)
```

## Handling props update

Similar to `componentDidUpdate`, `onUpdateProps` is called when the component's props have changed

```jsx
class CounterStore {
  onUpdateProps = (newProps) => {
    console.log(newProps)
  }
}
```
