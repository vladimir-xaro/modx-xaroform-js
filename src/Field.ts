import {
  Field         as I_Field,
  FieldCtorCfg  as I_FieldConstructorConfig,
  Form          as I_XaroForm,
  Error         as I_Error,
  InputElement  as I_InputElement
} from "./types";
import $, { MicroDOM, nextTick } from "@xaro/micro-dom";
import { keys } from "./helpers";

export default class Field implements I_Field {
  form:           I_XaroForm;
  el:             HTMLElement;
  errorsWrapper?: HTMLElement
  inputs:         MicroDOM<I_InputElement>;
  subInputs?:     MicroDOM<HTMLOptionElement>;
  errors:       {
    [code: string]: {
      msg: string;
      el?: HTMLElement;
    }
  } = {};
  type:           string;
  name:           string;
  isMultiple:     boolean;
  isFile:         boolean;

  constructor(config: I_FieldConstructorConfig) {
    this.form           = config.form;
    this.el             = config.el;
    this.errorsWrapper  = this.el.querySelector<HTMLElement>('.x-form__field-errors') || undefined;
    this.inputs         = config.inputs;
    this.name           = config.name;
    this.type           = config.type;

    this.isMultiple = this.name.includes('[]');
    this.isFile     = this.type === 'file';
  }

  get value(): FormDataEntryValue | FormDataEntryValue[] | null {
    const data = new FormData(this.form.config.el);

    return this.isMultiple ? data.getAll(this.name) : data.get(this.name);
  }

  public clearValue(): void {
    if (this.isMultiple) {
      this.inputs.forEach(input => (input as HTMLInputElement).checked = false);
    } else {
      this.inputs.forEach(input => input.value = '');
    }
  }

  public addError(code: string|number, msg: string, el?: HTMLElement): void {
    this.el.classList.add('x-form__field--error');

    if (! keys(this.errors).includes('' + code)) {
      if (! el) {
        const $el = $().create<HTMLElement>({ content: msg }).addClass('x-form__field-error');
        el = $el[0];
      }

      this.errors[code] = {
        msg,
        el
      };
      
      (this.errorsWrapper || this.el).append(this.errors[code].el!);
      nextTick(() => el!.classList.add('x-form__field-error--show'));
    }
  }

  public removeError(code: string) : void {
    if (keys(this.errors).includes(code)) {
      this.errors[code].el?.remove();
      delete this.errors[code];
    }

    if (! keys(this.errors).length) {
      this.el.classList.remove('x-form__field--error');
    }
  }

  public clearErrors() : void {
    for (const error_code in this.errors) {
      this.removeError(error_code);
    }
    this.el.classList.remove('x-form__field--error');
  }
}