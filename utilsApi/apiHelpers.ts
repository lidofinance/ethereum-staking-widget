export type ParamErrorReason = { [param_key: string]: string };

export class ParamError extends Error {
  params: ParamErrorReason;
  constructor(params: ParamErrorReason, options?: ErrorOptions) {
    super('invalid params', options);
    this.params = params;
  }
}
