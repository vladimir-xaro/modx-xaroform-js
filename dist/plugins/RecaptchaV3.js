var RecaptchaV3 = {
  g: window.grecaptcha,
  _name: "RecaptchaV3",
  _ready: !1,
  _class: void 0,
  _loaded: !1,
  _queue: [],
  _runQueue() {
    for (const form of this._queue) this._generateTokens(form);
  },
  _onReady(cb) {
    this.g.ready((() => {
      this._ready = !0, cb();
    }));
  },
  _execute(form) {
    this.g.execute(this._class.config.recaptcha_site, {
      action: form.config.recaptcha_action
    }).then((token => {
      form.plugins.config[this._name].input.value = token, form.unlockBtns();
    }));
  },
  _generateTokens(form) {
    this._ready ? this._execute(form) : this._onReady((() => this._execute(form)));
  },
  init(form) {
    if (this._class || (this._class = form.constructor), 0 === this._class.numbers) if (this.g) this.g = window.grecaptcha, 
    this._loaded = !0; else {
      const lib = document.createElement("script");
      lib.src = "https://www.google.com/recaptcha/api.js?render=" + this._class.config.recaptcha_site, 
      document.head.append(lib), lib.onload = () => {
        this.g = window.grecaptcha, this._loaded = !0, this._runQueue(), this._queue = [];
      };
    }
    const input = document.createElement("input");
    input.setAttribute("type", "hidden"), input.setAttribute("name", "g-recaptcha-response"), 
    input.setAttribute("id", "g-recaptcha-" + this._class.numbers), form.plugins.config[this._name] = {
      input: input
    }, form.config.el.append(input), this._loaded ? this._generateTokens(form) : this._queue.push(form);
  },
  afterSubmit(form, success, errors, side) {
    "client" !== side && this._generateTokens(form);
  }
};

export default RecaptchaV3;
//# sourceMappingURL=RecaptchaV3.js.map
