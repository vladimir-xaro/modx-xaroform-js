import EventEmitter from '@xaro/event-emitter';
import $, { MicroDOM, nextTick } from '@xaro/micro-dom';
import { I_XaroForm, I_XaroFormInitializeConfig, I_XaroFormConstructorConfig, I_XaroFormConfig, I_Field, InputElement, XaroFormPlugin  } from './types';
import Validator from './Validator';
import Field from './Field';
import { camelToSnake, difference, intersection, keys, snakeToCamel } from './helpers';

export default class XaroForm implements I_XaroForm {
  public static EventEmitter  = EventEmitter;
  public static MicroDOM      = MicroDOM;

  // object with all registered plugins
  public static plugins: { [key: string]: XaroFormPlugin } = {};

  // all forms instances
  public static instances: { [key: string]: XaroForm[] } = {};

  // forms amount
  public static numbers: number = 0;
  
  // common forms config
  public static config: {
    lexicon: { [key: string]: string };
    [key: string]: any;
  };

  // custom validators
  public static customValidators: { [key: string]: Function } = {};

  // event emitter
  public emitter: EventEmitter;

  // current form config
  public config: I_XaroFormConfig;

  // fields elements with inputs
  public fields: { [key: string]: I_Field } = {};

  // form buttons element (submit/reset/etc)
  public btns: { [key: string]: Array<HTMLButtonElement | HTMLInputElement> } = {};

  // other errors wrapper
  public errorsEl?: HTMLElement;

  // other errors object
  public errors: {
    [field_key: string]: {
      [code: string]: {
        msg: string,
        el?: HTMLElement
      }
    }
  } = {};

  // plugins for current instance
  public plugins: {
    list:   string[],
    config: {}
  } = {
    list:   [],
    config: {}
  };

  /**
   * Registers plugin for XaroForm
   * @param name string Plugin's name
   * @param plugin XaroFormPlugin Plugin's object
   */
  public static addPlugin(name: string, plugin: XaroFormPlugin): void {
    XaroForm.plugins[name] = plugin;
  }

  /**
   * Removes plugin by name
   * @param name string Plugin's name
   */
  public static removePlugin(name: string): void {
    delete XaroForm.plugins[name];
  }

  /**
   * Initialize all forms from config
   * @param config I_XaroFormInitializeConfig
   */
  public static initialize(config: I_XaroFormInitializeConfig): void {
    XaroForm.config = config.common;

    if ((window as any).XaroFormPlugins) {
      for (const key in (window as any).XaroFormPlugins) {
        XaroForm.addPlugin(key, (window as any).XaroFormPlugins[key]);
      }
    }

    for (const key in config.forms) {
      XaroForm.instances[key] = [];
      const forms: MicroDOM<HTMLFormElement> = $(`${config.forms[key]['form_selector']}[data-form-key="${key}"]`);
      for (const el of forms) {
        XaroForm.instances[key].push(new XaroForm(Object.assign({}, config.forms[key], {
          el,
          on: (window as any).XaroFormEvents || {}
        })));
        XaroForm.numbers++;
      }
    }

    // console.log(config, XaroForm.instances);
  }

  constructor(config: I_XaroFormConstructorConfig) {
    this.emitter = new EventEmitter(config.on);
    this.config = config;

    // Fields
    for (const el of $(this.config.el).get<HTMLElement>('.x-form__field')) {
      const inputs: MicroDOM<InputElement> = $(el).get<InputElement>('.x-form__input');

      if (! inputs.length) {
        throw new Error("Field element has not contains input element/s");
      }

      const name: string = inputs[0].name;

      if (! name) {
        throw new Error("Name of input element does not exists");
      }

      this.fields[name] = new Field({
        form: this,
        el,
        inputs,
        name,
        type: inputs[0].type,
      });
    }

    // Buttons (submit/reset/etc)
    let btn_i = 0;
    for (const btn of $(this.config.el).get<HTMLButtonElement|HTMLInputElement>('.x-form__btn')) {
      const type: string|null = btn.getAttribute('type');
      if (type) {
        if (type in this.btns) {
          this.btns[type].push(btn);
        } else {
          this.btns[type] = [ btn ];
        }
      } else {
        this.btns['undefined_' + btn_i] = [ btn ];
        btn_i++;
      }
    }
    this.lockBtns();

    // Common errors wrapper el
    const errorsEl = $(this.config.el).get<HTMLElement>('.x-form__errors');
    this.errorsEl = errorsEl.length ? errorsEl[0] : undefined;

    // Submit listener
    this.config.el.addEventListener('submit', e => {
      e.preventDefault();

      this.submit();

      return false;
    });


    // plugins
    const pluginKeys = keys(XaroForm.plugins);
    if (this.config.plugins) {
      let plugins: string[] = [];
      for (let i = 0; i < this.config.plugins.length; i++) {
        if (pluginKeys.includes(this.config.plugins[i])) {
          plugins.push(this.config.plugins[i]);
        }
      }
      this.plugins.list = plugins;
    }

    this.runPlugins('init', this);
    this.emitter.emit('init', this);
  }

  public runPlugins(method: string, ...args): void {
    for (const key of this.plugins.list) {
      if (method in XaroForm.plugins[key]) {
        XaroForm.plugins[key][method](this, ...args);
      }
    }
  }


  public validate() {
    const rules = this.parseRules();

    // codes
    let codes: { [key: string]: { [method: string]: (string | number | boolean | undefined) } } = {};
    for (const field in rules) {
      for (const rule of rules[field]) {
        const result = Validator[rule.method](this.fields[field], rule.value);
        if (! result) {
          if (! codes[field]) {
            codes[field] = {};
          }
          codes[field][rule.method] = rule.value;
        }
      }
    }

    // get text error
    let errors: { [key: string]: { [code: string]: string } } = {};
    for (const field in codes) {
      for (const code in codes[field]) {
        const _code = camelToSnake(code);
        const msg = this.config.lexicon && this.config.lexicon[_code]
          ? this.config.lexicon.errors[_code]
          : XaroForm.config.lexicon.errors[_code];

        if (typeof errors[field] === 'undefined') {
          errors[field] = {};
        }

        errors[field][_code] = msg.replace('$', codes[field][code] as string || '');
      }
    }

    return {
      success: !keys(errors).length,
      errors,
    };
  }

  protected parseRules(): Object {
    const validateProperty: string[] = this.config.client_validate.split(',');

    let fields: { [key: string]: string[] } = {};
    for (const item of validateProperty) {
      let _item: string[] = item.split(':');
      if (item.length) {
        fields[_item.shift()!] = _item;
      }
    }

    let fieldValidators: {
      [key: string]: {
        method: string,
        value?: string | number | boolean
      }[]
    } = {};
    for (const key in fields) {
      for (const v of fields[key]) {
        const _v: string[] = v.split('=');

        // if (tmpValidatorMethods.indexOf(_v[0]) === -1) {
        //   continue;
        // }

        if (typeof Validator[_v[0]] !== 'function') {
          continue;
        }

        if (! Array.isArray(fieldValidators[key])) {
          fieldValidators[key] = [];
        }

        fieldValidators[key].push({
          method: _v.shift()!,
          value:  _v.length ? _v[0].replace(/\^+|\^+/g, '') : undefined
        })
      }
    }

    return fieldValidators;
  }

  submit(): void {
    this.lockBtns();

    this.runPlugins('beforeSubmit', this);
    this.emitter.emit('beforeSubmit', this);

    const validator = this.validate();
    
    // clear fields errors
    for (const field_key in this.fields) {
      this.fields[field_key].clearErrors();
    }

    // clear other errors
    this.clearErrors();

    if (! validator.success) {
      for (const field_key in validator.errors) {
        for (const error_code in validator.errors[field_key]) {
          this.fields[field_key].addError(error_code, validator.errors[field_key][error_code]);
        }
      }

      this.unlockBtns();
      // this, success, errors, side (client/server)
      this.runPlugins('afterSubmit', this, validator.success, validator.errors, 'client');
      this.emitter.emit('afterSubmit', this, validator.success, validator.errors, 'client');
      return;
    }

    fetch(this.config['action_url'], {
      method: 'POST',
      // headers: {
      //   'Content-Type': this.config.el.getAttribute('enctype')
      // },
      body: new FormData(this.config.el)
    })
    .then(response => {
      // console.log(response.text());
      return response.json();
    })
    .then(data => {
      if (! data.success) {
        // arrays of keys
        const fields        = keys(this.fields);
        const dataFields    = keys(data.errors);

        // other errors
        for (const key of difference(fields, dataFields)) {
          for (const code in data.errors[key]) {
            this.addError(key, code, data.errors[key][code]);
          }
        }

        // fields errors
        for (const key of intersection(dataFields, fields)) {
          for (const code in data.errors[key]) {
            this.fields[key].addError(code, data.errors[key][code]);
          }
        }
      }
      
      this.runPlugins('afterSubmit', this, data.success, data.errors, 'server');
      this.emitter.emit('afterSubmit', this, data.success, data.errors, 'server');
    });
  }

  addError(key: string, code: string, msg: string, el?: HTMLElement): void {
    if (keys(this.errors).includes(key) && keys(this.errors[key]).includes(code)) {
      return;
    }

    this.errors[key] = this.errors[key] || {};
    
    if (this.errorsEl) {
      if (! el) {
        const $el = $().create<HTMLElement>({ content: msg }).addClass('x-form__error').attr({
          'data-field-key':   key,
          'data-error-code':  code,
        });
        
        this.errorsEl.append($el[0]);
        
        nextTick(() => $el.addClass('x-form__error--show'));

        el = $el[0];
      }
    }

    this.errors[key][code] = {
      msg,
      el
    }
  }

  removeError(key: string, code: string): void {
    if (! keys(this.errors).includes(key) &&
        ! keys(this.errors[key]).includes(code)) {
      return;
    }

    this.errors[key][code].el?.remove();
    delete this.errors[key][code];
  }

  clearErrors(): void {
    // fields errors
    for (const key in this.fields) {
      this.fields[key].clearErrors();
    }

    // other errors
    for (const key in this.errors) {
      for (const code in this.errors[key]) {
        this.removeError(key, code);
      }
    }
  }

  changeDisabledAttr(value: boolean): void {
    for (const key in this.btns) {
      for (const btn of this.btns[key]) {
        btn.disabled = value;
      }
    }
  }

  lockBtns(): void {
    this.changeDisabledAttr(true);
  }

  unlockBtns(): void {
    this.changeDisabledAttr(false);
  }
}