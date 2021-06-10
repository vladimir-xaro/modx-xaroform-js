import { EventEmitterConstructorConfig } from "@xaro/event-emitter";
import { MicroDOM } from "@xaro/micro-dom";

// Common
export type InputElement = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

// XaroForm
export interface I_XaroForm {
  config: I_XaroFormConfig;
  fields: { [key: string]: I_Field };
}

export interface I_XaroFormCommonConfig {
  action_url:       string;
  form_selector:    string;
  action_key:       string;
  form_key:         string;
  client_validate:  string;
  [key: string]:    any;
}

export interface I_XaroFormInitializeConfig {
  common: {
    lexicon: { [key: string]: string };
    [key: string]: any;
  };
  forms: { [key: string]: I_XaroFormCommonConfig };
}

export interface I_XaroFormConstructorConfig extends I_XaroFormCommonConfig {
  el:       HTMLFormElement;
  on?:      EventEmitterConstructorConfig;
  lexicon?: { [key: string]: string };
}

export interface I_XaroFormConfig extends I_XaroFormConstructorConfig {
  
}

export interface XaroFormPlugin {
  init?(form: I_XaroForm);
  beforeSubmit?(form: I_XaroForm);
  afterSubmit?(form: I_XaroForm);
}

// Field
export interface I_Field {
  form:       I_XaroForm;
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

export interface I_FieldConstructorConfig {
  form:   I_XaroForm;
  el:     HTMLElement;
  inputs: MicroDOM<InputElement>;
  name:   string;
  type:   string;
}

// Error
export interface I_Error {
  field:  I_Field;
  el:     HTMLElement;
  msg:    string;
}