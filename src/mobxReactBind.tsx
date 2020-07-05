import "reflect-metadata";
import React, { useEffect, useMemo, useRef } from "react";
import { observer } from "mobx-react";
import { ReflectiveInjector } from "injection-js";

interface IConnectPramaters {
  container: any;
  providers?: any[];
}

const injector = ReflectiveInjector.resolveAndCreate([]);

// TODO implement injector.add in library

// @ts-ignore
injector.add = function(_providers: ResolvedReflectiveProvider[]) {
  _providers.forEach(provider => {
    // @ts-ignore
    if (this.keyIds.includes(provider.key.id)) {
      return;
    }
    // @ts-ignore
    this.keyIds.push(provider.key.id);
    // @ts-ignore
    this.objs.push(this._new(provider));
  });
};

const mobxReactBind = ({ container, providers = [] }: IConnectPramaters) => {
  const resolvedProviders = ReflectiveInjector.resolve(providers.concat(container));

  // @ts-ignore
  injector.add(resolvedProviders);

  return (Element: any): any => {
    const ReturnComp = (props: any): any => {
      const didMountRef = useRef(false);

      const OElement: any = observer(Element);
      const _container = useMemo(() => {
        return injector.resolveAndInstantiate(container);
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
}

export interface IStoreDependencies {}

export default mobxReactBind;
