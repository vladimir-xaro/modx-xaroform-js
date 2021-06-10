export default {
  g: (window as any).grecaptcha,
  _name: 'RecaptchaV3',
  _ready: false,
  _class: undefined,
  _loaded: false,
  _queue: [],
  _runQueue() {
    for (const form of this._queue) {
      this._generateTokens(form);
    }
  },
  _onReady(cb) {
    this.g.ready(() => {
      this._ready = true;
      cb();
    });
  },
  _execute(form) {
    this.g.execute(this._class.config['recaptcha_site'], { action: form.config.recaptcha_action })
    .then(token => {
      form.plugins.config[this._name].input.value = token;
      form.unlockBtns();
    });
  },
  _generateTokens(form) {
    if (this._ready) {
      this._execute(form);
    } else {
      this._onReady(() => this._execute(form));
    }
  },
  init(form) {
    if (! this._class) {
      this._class = form.constructor;
    }

    if (this._class.numbers === 0) {
      if (! this.g) {
        const lib = document.createElement('script');
        lib.src = 'https://www.google.com/recaptcha/api.js?render=' + this._class.config['recaptcha_site'];
        document.head.append(lib);
        lib.onload = () => {
          this.g = (window as any).grecaptcha;
          this._loaded = true;
          this._runQueue();
          this._queue = [];
        }
      } else {
        this.g = (window as any).grecaptcha;
        this._loaded = true;
      }
    }

    const input = document.createElement('input');
    input.setAttribute('type', 'hidden');
    input.setAttribute('name', 'g-recaptcha-response');
    input.setAttribute('id', 'g-recaptcha-' + this._class.numbers);
    form.plugins.config[this._name] = {
      input,
    }
    form.config.el.append(input);

    if (this._loaded) {
      this._generateTokens(form);
    } else {
      this._queue.push(form);
    }
  },
  afterSubmit(form, success, errors, side) {
    if (side === 'client') {
      return;
    }

    this._generateTokens(form);
  }
};