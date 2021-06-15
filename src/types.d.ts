import EventEmitter, { EventEmitterConstructorConfig } from "@xaro/event-emitter";
import { MicroDOM } from "@xaro/micro-dom";

// Common
export type InputElement = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

export interface FormCtor {
  // object with all registered plugins
  plugins: { [key: string]: FormPlugin };

  // all forms instances
  instances: { [key: string]: Form[] };

  // forms amount
  numbers: number;

  // common forms config
  config: {
    lexicon: { [key: string]: string };
    [key: string]: any;
  };

  // custom validators
  customValidators: { [key: string]: Function };

  /**
   * Registers plugin for XaroForm
   * @param name string Plugin's name
   * @param plugin XaroFormPlugin Plugin's object
   */
  addPlugin(name: string, plugin: FormPlugin): void;

  /**
   * Removes plugin by name
   * @param name string Plugin's name
   */
  removePlugin(name: string): void;

  /**
   * Initialize all forms from config
   * @param config I_XaroFormInitializeConfig
   */
  initialize(config: FormInitCfg): void;

  new(config: FormCtorCfg);
}

// XaroForm
export default class Form {
  emitter: EventEmitter;

  // current form config
  config: FormCfg;

  // fields elements with inputs
  fields: { [key: string]: Field };

  // form buttons element (submit/reset/etc)
  btns: { [key: string]: Array<HTMLButtonElement | HTMLInputElement> };

  // other errors wrapper
  errorsEl?: HTMLElement;

  // other errors object
  errors: {
    [field_key: string]: {
      [code: string]: {
        msg: string,
        el?: HTMLElement
      }
    }
  };

  // plugins for current instance
  plugins: {
    list: string[],
    config: {}
  };

  constructor(config: FormCtorCfg);

  runPlugins(method: string, ...args): void;
  validate(): {
    success: boolean;
    errors: { [key: string]: { [code: string]: string } };
  };
  submit(): void;
  addError(key: string, code: string, msg: string, el?: HTMLElement): void;
  removeError(key: string, code: string): void;
  clearErrors(): void;
  changeDisabledAttr(value: boolean): void;
  lockBtns(): void;
  unlockBtns(): void;
  reset(): void;
}

export interface FormCommonCfg {
  action_url:       string;
  form_selector:    string;
  action_key:       string;
  form_key:         string;
  client_validate:  string;
  [key: string]:    any;
}

export interface FormInitCfg {
  common: {
    lexicon: { [key: string]: string };
    [key: string]: any;
  };
  forms: { [key: string]: FormCommonCfg };
}

export interface FormCtorCfg extends FormCommonCfg {
  el:         HTMLFormElement;
  lockBtns?:  boolean;
  on?:        EventEmitterConstructorConfig;
  lexicon?:   { [key: string]: string };
}

export interface FormCfg extends FormCtorCfg {
  
}

export interface FormPlugin {
  init?(form: Form);
  beforeSubmit?(form: Form);
  afterSubmit?(form: Form);
}

// Field
export interface Field {
  form:       Form;
  el:         HTMLElement;
  inputs:     MicroDOM<InputElement>;
  subInputs?: MicroDOM<HTMLOptionElement>;
  errors: {
    [code: string]: {
      msg: string;
      el?: HTMLElement;
    }
  };
  type:       string;
  name:       string;
  isMultiple: boolean;
  isFile:     boolean;

  // getters
  value: FormDataEntryValue | FormDataEntryValue[] | null;

  addError(code: string|number, msg: string): void;
  removeError(code: string): void;
  clearErrors(): void;
}

export interface FieldCtorCfg {
  form:   Form;
  el:     HTMLElement;
  inputs: MicroDOM<InputElement>;
  name:   string;
  type:   string;
}

// Error
export interface Error {
  field:  Field;
  el:     HTMLElement;
  msg:    string;
}