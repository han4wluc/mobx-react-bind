
# Installation

`npm install mobx-react-bind`

or

`yarn add mobx-react-bind`

# Usage

## Basic Usage

Define a mobx store
```jsx
import { observable, action } from 'mobx'

class CounterContainer {
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
  const { container } = props
  return (
    <div onClick={container.increment}>{container.count}</div>
  )
}
```

Bind mobx store and react view

```jsx
import mobxReactBind from 'mobx-react-bind'

const CounterComponent = mobxReactBind({
  container: CounterContainer,
})(CounterView)


// You can then just use it as a usual react component
<CounterComponent />

```

## React lifecycle methods

In the mobx store, you can add a `mount` method that will be called when the component is mounted.

It also accepts a function as a return value that will be called when the component is unmounted.

```jsx
class CounterContainer {
  
  mount = () => {
    console.log('mount')
    return () => {
      console.log('unmount')
    }
  }
}
```
