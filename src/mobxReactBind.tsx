import "reflect-metadata";
import React, { useEffect, useMemo, useRef } from "react";
import { observer } from "mobx-react";
import { ReflectiveInjector, ResolvedReflectiveProvider } from "injection-js";

interface IConnectPramaters {
  container: any;
  providers?: any[];
}

function add(_providers: ResolvedReflectiveProvider[]) {
  try {
    for (let provider of _providers) {
      // @ts-ignore
      if (this.keyIds.includes(provider.key.id)) {
        return;
      }
      // @ts-ignore
      this.keyIds.push(provider.key.id);
      // @ts-ignore
      this.objs.push(null)
      this.objs[this.objs.length - 1] = this._new(provider)
    }
  } catch (error) {
    console.log('injector.add Error')
    console.log(this.keyIds)
    console.log(this.objs)
    throw error
  }
}

let parentInjector = ReflectiveInjector.resolveAndCreate([]);

// @ts-ignore
parentInjector.add = add;

export const getInjector = () => {
  return parentInjector;
}

// TODO implement injector.add in library

export const addCommonProviders = (providers = []) => {
  // @ts-ignore
  parentInjector.add(ReflectiveInjector.resolve(providers));
};

export const resetInjector = () => {
  parentInjector = ReflectiveInjector.resolveAndCreate([]);
  // @ts-ignore
  parentInjector.add = add;
};

export const mobxReactBind = ({
  container,
  providers = [],
}: IConnectPramaters) => {
  const resolvedProviders = ReflectiveInjector.resolve(providers);

  const resolvedContainer = ReflectiveInjector.resolve([container])
  const injector = ReflectiveInjector.fromResolvedProviders(resolvedContainer, parentInjector)

  // @ts-ignore
  parentInjector.add(resolvedProviders);

  return (Element: any): any => {
    const ReturnComp = (props: any): any => {
      const didMountRef = useRef(false);

      const OElement: any = observer(Element);
      const _container = useMemo(() => {
        return injector.instantiateResolved(resolvedContainer[0]);
      }, [0]);

      useEffect(() => {
        if (_container.mount) {
          return _container.mount();
        }
      }, [0]);

      useEffect(() => {
        if (didMountRef.current) {
          if (_container.onUpdateProps) {
            _container.onUpdateProps(props);
          }
        } else {
          didMountRef.current = true;
        }
      }, [props]);
      return <OElement {...props} container={_container} />;
    };
    return ReturnComp;
  };
};

export default mobxReactBind;
