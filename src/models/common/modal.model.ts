export interface IModalRequest<T> {
  visible: boolean;
  data?: T;
  [key: string]: unknown;
}

export class IModalFormValue<T> implements IModalRequest<T> {
  visible: boolean = false;
  data?: T;
  [key: string]: unknown;

  constructor(values?: IModalRequest<T>) {
    Object.assign(this, values);
  }
}
