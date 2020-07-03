import mobxReactBind from "./mobxReactBind";
import ModalStore from './stores/ModalStore'
import ResourceStore from './stores/ResourceStore'
import { Injectable } from "injection-js";

export default mobxReactBind;

export {
  ModalStore,
  ResourceStore,
  Injectable
}
