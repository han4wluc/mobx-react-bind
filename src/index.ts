import "reflect-metadata";
import mobxReactBind from "./mobxReactBind";
import ModalStore from './stores/ModalStore'
import ResourceStore from './stores/ResourceStore'
import { Injectable, Inject } from "injection-js";

export default mobxReactBind;

export {
  ModalStore,
  ResourceStore,
  Injectable,
  Inject,
}
