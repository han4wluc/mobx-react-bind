import React, { useEffect, useState, useMemo, useRef } from "react";
import { observer } from "mobx-react";
import "reflect-metadata";
import { ReflectiveInjector, Injectable, Injector } from "injection-js";

interface IConnectPramaters {
  Store: any;
  providers?: any[];
}

function mobxReactBind({ Store, providers = [] }: IConnectPramaters) {
  const providerss = providers.concat(Store);

  return (Element: any): any => {
    const ReturnComp = (props: any): any => {
      const didMountRef = useRef(false);

      const OElement: any = observer(Element);
      const store = useMemo(() => {
        const injector = ReflectiveInjector.resolveAndCreate(providerss);
        return injector.get(Store);
      }, [0, providerss]);

      useEffect(() => {
        if (store.mount) {
          return store.mount();
        }
      }, [0]);

      useEffect(() => {
        if (didMountRef.current) {
          if (store.onUpdateProps) {
            store.onUpdateProps(props);
          }
        } else {
          didMountRef.current = true;
        }
      }, [props]);
      return <OElement {...props} store={store} />;
    };
    return ReturnComp;
  };
}

export interface IStoreDependencies {}

export default mobxReactBind;
