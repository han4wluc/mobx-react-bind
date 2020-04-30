import React, { useEffect, useState, useMemo, useRef } from 'react';
import { observer } from 'mobx-react';

interface IConnectPramaters<T> {
  Store: any;
  dependencies?: T;
}

function mobxReactBind<T>({
  Store,
  dependencies,
}: IConnectPramaters<T>) {
  return (Element: any): any => {
    const ReturnComp = (props: any): any => {
      const didMountRef = useRef(false);

      const OElement: any = observer(Element);
      const store = useMemo(() => {
        return new Store({ ...dependencies, ...props.dependencies }, props)
      }, [0])

      useEffect(() => {
        if (store.mount) {
          return store.mount()
        }
      }, [0]);

      useEffect(() => {
        if (didMountRef.current) {
          if (store.onUpdateProps) {
            store.onUpdateProps(props)
          }
        } else {
          didMountRef.current = true;
        }
      }, [props]);
      return <OElement {...props} store={store} />;
    };
    ReturnComp.displayName = ReturnComp.displayName;
    return ReturnComp;
  };
}

export interface IStoreDependencies {}

export default mobxReactBind;
