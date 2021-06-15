export default class RecaptchaV3 {
  public static g        = grecaptcha;

  private static _name   ='RecaptchaV3';
  private static _ready  = false;
  private static _class  = undefined;
  private static _loaded = false;
  private static _queue  = [];

  private static _runQueue() {
    for (const form of RecaptchaV3._queue) {
      RecaptchaV3._generateTokens(form);
    }
  };
  private static _onReady(cb) {
    RecaptchaV3.g.ready(() => {
      RecaptchaV3._ready = true;
      cb();
    });
  };

  private static _execute(form) {
    RecaptchaV3.g.execute(RecaptchaV3._class.config['recaptcha_site'], { action: form.config.recaptcha_action })
    .then(token => {
      form.plugins.config[RecaptchaV3._name].input.value = token;
      form.unlockBtns();
    });
  };

  private static _generateTokens(form) {
    if (RecaptchaV3._ready) {
      RecaptchaV3._execute(form);
    } else {
      RecaptchaV3._onReady(() => RecaptchaV3._execute(form));
    }
  };

  public static init(form) {
    if (! RecaptchaV3._class) {
      RecaptchaV3._class = form.constructor;
    }

    if (RecaptchaV3._class.numbers === 0) {
      if (! RecaptchaV3.g) {
        const lib = document.createElement('script');
        lib.src = 'https://www.google.com/recaptcha/api.js?render=' + RecaptchaV3._class.config['recaptcha_site'];
        document.head.append(lib);
        lib.onload = () => {
          RecaptchaV3.g = (window as any).grecaptcha;
          RecaptchaV3._loaded = true;
          RecaptchaV3._runQueue();
          RecaptchaV3._queue = [];
        }
      } else {
        RecaptchaV3.g = (window as any).grecaptcha;
        RecaptchaV3._loaded = true;
      }
    }

    const input = document.createElement('input');
    input.setAttribute('type', 'hidden');
    input.setAttribute('name', 'g-recaptcha-response');
    input.setAttribute('id', 'g-recaptcha-' + RecaptchaV3._class.numbers);
    form.plugins.config[RecaptchaV3._name] = {
      input,
    }
    form.config.el.append(input);

    if (RecaptchaV3._loaded) {
      RecaptchaV3._generateTokens(form);
    } else {
      RecaptchaV3._queue.push(form);
    }
  };

  public static afterSubmit(form, success, errors, side) {
    if (side === 'client') {
      return;
    }

    RecaptchaV3._generateTokens(form);
  }
}