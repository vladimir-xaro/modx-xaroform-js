import EventEmitter from "@xaro/event-emitter";

import $, { nextTick, MicroDOM } from "@xaro/micro-dom";

class Validator {
  static required(field) {
    if (field.isMultiple) return !!field.value.length;
    if (field.isFile) {
      for (const input of field.inputs) if ("" !== input.value) return !0;
      return !1;
    }
    return null !== field.value && "" !== field.value;
  }
  static minLength(field, value) {
    return field.value.length >= +value;
  }
  static maxLength(field, value) {
    return field.value.length <= +value;
  }
  static email(field) {
    return !!field.value.match(/^[a-zA-Zа-яА-Яё\d][a-zA-Zа-яА-ЯёЁ\d\.\-_]*[a-zA-Zа-яА-ЯёЁ\d]\@[a-zA-Zа-яА-ЯёЁ\d]([a-zA-Zа-яА-ЯёЁ\d\-]|\.)+[a-zA-Zа-яА-ЯёЁ\d]{2,}$/);
  }
  static passwordConfirm(field, confirm_key) {
    return field.value === field.form.fields[confirm_key].value;
  }
}

const keys = obj => Object.keys(obj);

class Field {
  constructor(config) {
    this.errors = {}, this.form = config.form, this.el = config.el, this.inputs = config.inputs, 
    this.name = config.name, this.type = config.type, this.isMultiple = this.name.includes("[]"), 
    this.isFile = "file" === this.type;
  }
  get value() {
    const data = new FormData(this.form.config.el);
    return this.isMultiple ? data.getAll(this.name) : data.get(this.name);
  }
  addError(code, msg, el) {
    if (this.el.classList.add("x-form__field--error"), !keys(this.errors).includes(code + "")) {
      if (!el) {
        const $el = $().create({
          content: msg
        }).addClass("x-form__field-error");
        el = $el[0];
      }
      this.errors[code] = {
        msg: msg,
        el: el
      }, this.el.append(this.errors[code].el), nextTick((() => el.classList.add("x-form__field-error--show")));
    }
  }
  removeError(code) {
    keys(this.errors).includes(code) && (this.errors[code].el?.remove(), delete this.errors[code]), 
    keys(this.errors).length || this.el.classList.remove("x-form__field--error");
  }
  clearErrors() {
    for (const error_code in this.errors) this.removeError(error_code);
    this.el.classList.remove("x-form__field--error");
  }
}

class XaroForm {
  constructor(config) {
    this.fields = {}, this.btns = {}, this.errors = {}, this.plugins = {
      list: [],
      config: {}
    }, this.emitter = new EventEmitter(config.on), this.config = config;
    for (const el of $(this.config.el).get(".x-form__field")) {
      const inputs = $(el).get(".x-form__input");
      if (!inputs.length) throw new Error("Field element has not contains input element/s");
      const name = inputs[0].name;
      if (!name) throw new Error("Name of input element does not exists");
      this.fields[name] = new Field({
        form: this,
        el: el,
        inputs: inputs,
        name: name,
        type: inputs[0].type
      });
    }
    let btn_i = 0;
    for (const btn of $(this.config.el).get(".x-form__btn")) {
      const type = btn.getAttribute("type");
      type ? type in this.btns ? this.btns[type].push(btn) : this.btns[type] = [ btn ] : (this.btns["undefined_" + btn_i] = [ btn ], 
      btn_i++);
    }
    this.lockBtns();
    const errorsEl = $(this.config.el).get(".x-form__errors");
    this.errorsEl = errorsEl.length ? errorsEl[0] : void 0, this.config.el.addEventListener("submit", (e => (e.preventDefault(), 
    this.submit(), !1)));
    const pluginKeys = keys(XaroForm.plugins);
    if (this.config.plugins) {
      let plugins = [];
      for (let i = 0; i < this.config.plugins.length; i++) pluginKeys.includes(this.config.plugins[i]) && plugins.push(this.config.plugins[i]);
      this.plugins.list = plugins;
    }
    this.runPlugins("init", this), this.emitter.emit("init", this);
  }
  static addPlugin(name, plugin) {
    XaroForm.plugins[name] = plugin;
  }
  static removePlugin(name) {
    delete XaroForm.plugins[name];
  }
  static initialize(config) {
    if (XaroForm.config = config.common, window.XaroFormPlugins) for (const key in window.XaroFormPlugins) XaroForm.addPlugin(key, window.XaroFormPlugins[key]);
    for (const key in config.forms) {
      XaroForm.instances[key] = [];
      const forms = $(`${config.forms[key].form_selector}[data-form-key="${key}"]`);
      for (const el of forms) XaroForm.instances[key].push(new XaroForm(Object.assign({}, config.forms[key], {
        el: el,
        on: window.XaroFormEvents || {}
      }))), XaroForm.numbers++;
    }
  }
  runPlugins(method, ...args) {
    for (const key of this.plugins.list) method in XaroForm.plugins[key] && XaroForm.plugins[key][method](this, ...args);
  }
  validate() {
    const rules = this.parseRules();
    let codes = {};
    for (const field in rules) for (const rule of rules[field]) {
      Validator[rule.method](this.fields[field], rule.value) || (codes[field] || (codes[field] = {}), 
      codes[field][rule.method] = rule.value);
    }
    let errors = {};
    for (const field in codes) for (const code in codes[field]) {
      const _code = code.replace(/[A-Z]/g, (char => "_" + char.toLowerCase())), msg = this.config.lexicon && this.config.lexicon[_code] ? this.config.lexicon.errors[_code] : XaroForm.config.lexicon.errors[_code];
      void 0 === errors[field] && (errors[field] = {}), errors[field][_code] = msg.replace("$", codes[field][code] || "");
    }
    return {
      success: !keys(errors).length,
      errors: errors
    };
  }
  parseRules() {
    const validateProperty = this.config.client_validate.split(",");
    let fields = {};
    for (const item of validateProperty) {
      let _item = item.split(":");
      item.length && (fields[_item.shift()] = _item);
    }
    let fieldValidators = {};
    for (const key in fields) for (const v of fields[key]) {
      const _v = v.split("=");
      "function" == typeof Validator[_v[0]] && (Array.isArray(fieldValidators[key]) || (fieldValidators[key] = []), 
      fieldValidators[key].push({
        method: _v.shift(),
        value: _v.length ? _v[0].replace(/\^+|\^+/g, "") : void 0
      }));
    }
    return fieldValidators;
  }
  submit() {
    this.lockBtns(), this.runPlugins("beforeSubmit", this), this.emitter.emit("beforeSubmit", this);
    const validator = this.validate();
    for (const field_key in this.fields) this.fields[field_key].clearErrors();
    if (this.clearErrors(), !validator.success) {
      for (const field_key in validator.errors) for (const error_code in validator.errors[field_key]) this.fields[field_key].addError(error_code, validator.errors[field_key][error_code]);
      return this.unlockBtns(), this.runPlugins("afterSubmit", this, validator.success, validator.errors, "client"), 
      void this.emitter.emit("afterSubmit", this, validator.success, validator.errors, "client");
    }
    fetch(this.config.action_url, {
      method: "POST",
      body: new FormData(this.config.el)
    }).then((response => response.json())).then((data => {
      if (!data.success) {
        const fields = keys(this.fields), dataFields = keys(data.errors);
        for (const key of ((target, compare) => compare.filter((x => !target.includes(x))))(fields, dataFields)) for (const code in data.errors[key]) this.addError(key, code, data.errors[key][code]);
        for (const key of ((first, second) => first.filter((x => second.includes(x))))(dataFields, fields)) for (const code in data.errors[key]) this.fields[key].addError(code, data.errors[key][code]);
      }
      this.runPlugins("afterSubmit", this, data.success, data.errors, "server"), this.emitter.emit("afterSubmit", this, data.success, data.errors, "server");
    }));
  }
  addError(key, code, msg, el) {
    if (!keys(this.errors).includes(key) || !keys(this.errors[key]).includes(code)) {
      if (this.errors[key] = this.errors[key] || {}, this.errorsEl && !el) {
        const $el = $().create({
          content: msg
        }).addClass("x-form__error").attr({
          "data-field-key": key,
          "data-error-code": code
        });
        this.errorsEl.append($el[0]), nextTick((() => $el.addClass("x-form__error--show"))), 
        el = $el[0];
      }
      this.errors[key][code] = {
        msg: msg,
        el: el
      };
    }
  }
  removeError(key, code) {
    (keys(this.errors).includes(key) || keys(this.errors[key]).includes(code)) && (this.errors[key][code].el?.remove(), 
    delete this.errors[key][code]);
  }
  clearErrors() {
    for (const key in this.fields) this.fields[key].clearErrors();
    for (const key in this.errors) for (const code in this.errors[key]) this.removeError(key, code);
  }
  changeDisabledAttr(value) {
    for (const key in this.btns) for (const btn of this.btns[key]) btn.disabled = value;
  }
  lockBtns() {
    this.changeDisabledAttr(!0);
  }
  unlockBtns() {
    this.changeDisabledAttr(!1);
  }
}

XaroForm.EventEmitter = EventEmitter, XaroForm.MicroDOM = MicroDOM, XaroForm.plugins = {}, 
XaroForm.instances = {}, XaroForm.numbers = 0, XaroForm.customValidators = {};

export default XaroForm;
//# sourceMappingURL=xaroform.0.0.1-pl.js.map
