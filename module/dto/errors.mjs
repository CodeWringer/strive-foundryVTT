export class Exception extends Error {
  get prefix() { return ""; }

  /**
   * @type {String}
   * @private
   */
  _message = undefined;
  get message() { return `${this.prefix}: ${this._message}` }

  constructor(message = undefined, innerError = undefined) {
    super(message);

    this._message = message;
    this.innerError = innerError;
  }
}

export class NotImplementedException extends Exception {
  get prefix() { return "NotImplementedException"; }
}

export class InvalidStateException extends Exception {
  get prefix() { return "InvalidStateException"; }
}

export class InvalidParameterException extends Exception {
  get prefix() { return "InvalidParameterException"; }
}