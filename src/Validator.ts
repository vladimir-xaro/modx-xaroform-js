import { I_Field } from "./types";

export default class Validator {
  public static required(field: I_Field) : boolean {
    if (field.isMultiple) {
      return !!(field.value as FormDataEntryValue[]).length;
    } else if (field.isFile) {
      for (const input of field.inputs) {
        if (input.value !== '') {
          return true;
        }
      }
      return false;
    }

    return field.value !== null && field.value !== '';
    // return field.isMultiple ? !!(field.value as FormDataEntryValue[]).length : field.value !== '';
  }

  public static minLength(field: I_Field, value: string) : boolean {
    return (field.value as string).length >= +value;
  }

  public static maxLength(field: I_Field, value: string) : boolean {
    return (field.value as string).length <= +value;
  }

  public static email(field: I_Field) : boolean {
    return !!(field.value as string).match(/^[a-zA-Zа-яА-Яё\d][a-zA-Zа-яА-ЯёЁ\d\.\-_]*[a-zA-Zа-яА-ЯёЁ\d]\@[a-zA-Zа-яА-ЯёЁ\d]([a-zA-Zа-яА-ЯёЁ\d\-]|\.)+[a-zA-Zа-яА-ЯёЁ\d]{2,}$/);
  }

  public static passwordConfirm(field: I_Field, confirm_key: string) : boolean {
    return field.value === field.form.fields[confirm_key].value;
  }

  // public static file
}