import { EventEmitterConstructorConfig } from "@xaro/event-emitter";
import { MicroDOM } from "@xaro/micro-dom";

// Common
export type InputElement = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

// XaroForm
export interface Form {
  config: FormCfg;
  fields: { [key: string]: Field };
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