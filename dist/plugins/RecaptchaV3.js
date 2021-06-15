class RecaptchaV3 {
  static _runQueue() {
    for (const form of RecaptchaV3._queue) RecaptchaV3._generateTokens(form);
  }
  static _onReady(cb) {
    RecaptchaV3.g.ready((() => {
      RecaptchaV3._ready = !0, cb();
    }));
  }
  static _execute(form) {
    RecaptchaV3.g.execute(RecaptchaV3._class.config.recaptcha_site, {
      action: form.config.recaptcha_action
    }).then((token => {
      form.plugins.config[RecaptchaV3._name].input.value = token, form.unlockBtns();
    }));
  }
  static _generateTokens(form) {
    RecaptchaV3._ready ? RecaptchaV3._execute(form) : RecaptchaV3._onReady((() => RecaptchaV3._execute(form)));
  }
  static init(form) {
    if (RecaptchaV3._class || (RecaptchaV3._class = form.constructor), 0 === RecaptchaV3._class.numbers) if (RecaptchaV3.g) RecaptchaV3.g = window.grecaptcha, 
    RecaptchaV3._loaded = !0; else {
      const lib = document.createElement("script");
      lib.src = "https://www.google.com/recaptcha/api.js?render=" + RecaptchaV3._class.config.recaptcha_site, 
      document.head.append(lib), lib.onload = () => {
        RecaptchaV3.g = window.grecaptcha, RecaptchaV3._loaded = !0, RecaptchaV3._runQueue(), 
        RecaptchaV3._queue = [];
      };
    }
    const input = document.createElement("input");
    input.setAttribute("type", "hidden"), input.setAttribute("name", "g-recaptcha-response"), 
    input.setAttribute("id", "g-recaptcha-" + RecaptchaV3._class.numbers), form.plugins.config[RecaptchaV3._name] = {
      input: input
    }, form.config.el.append(input), RecaptchaV3._loaded ? RecaptchaV3._generateTokens(form) : RecaptchaV3._queue.push(form);
  }
  static afterSubmit(form, success, errors, side) {
    "client" !== side && RecaptchaV3._generateTokens(form);
  }
}

RecaptchaV3.g = window.grecaptcha, RecaptchaV3._name = "RecaptchaV3", RecaptchaV3._ready = !1, 
RecaptchaV3._class = void 0, RecaptchaV3._loaded = !1, RecaptchaV3._queue = [];

export default RecaptchaV3;
//# sourceMappingURL=RecaptchaV3.js.map
