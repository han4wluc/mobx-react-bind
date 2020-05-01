import React, { useEffect, useState, useMemo, useRef } from "react";
import { observer } from "mobx-react";

interface IConnectPramaters<T> {
  Store: any;
  dependencies?: T;
  isGlobal?: boolean;
}

function mobxReactBind<T>({
  Store,
  dependencies,
  isGlobal = false,
}: IConnectPramaters<T>) {
  return (Element: any): any => {
    if (isGlobal) {
      const globalStore = new Store({ ...dependencies });
      const ReturnCompGlobal: any = (props: any): any => {
        const OElement: any = observer(Element);
        return <OElement {...props} store={globalStore} />;
      };
      return ReturnCompGlobal;
    }

    const ReturnComp = (props: any): any => {
      const didMountRef = useRef(false);

      const OElement: any = observer(Element);
      const store = useMemo(() => {
        return new Store({ ...dependencies, ...props.dependencies }, props);
      }, [0]);

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
