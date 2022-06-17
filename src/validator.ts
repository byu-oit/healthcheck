import { Static, TSchema } from '@sinclair/typebox'
import addFormats from 'ajv-formats'
import Ajv, { ValidateFunction } from 'ajv/dist/2019'

export class Validator<T extends TSchema> {
  public readonly validate: ValidateFunction<Static<T>>
  constructor (
    public readonly schema: T,
    private readonly ajv: Ajv = new Ajv()
  ) {
    this.ajv = addFormats(this.ajv, [
      'date-time',
      'time',
      'date',
      'email',
      'hostname',
      'ipv4',
      'ipv6',
      'uri',
      'uri-reference',
      'uuid',
      'uri-template',
      'json-pointer',
      'relative-json-pointer',
      'regex'
    ]).addKeyword('kind')
      .addKeyword('modifier')
    this.validate = this.ajv.compile(schema)
  }

  parse (data: unknown, errorMessage?: string): Static<T> {
    this.validate(data)
    if (this.validate.errors != null && this.validate.errors.length > 0) {
      throw new AjvError(this.validate.errors, errorMessage)
    }
    return data
  }
}

export class AjvError extends Error {
  constructor (public readonly validations: ValidateFunction['errors'], message?: string) {
    message = message !== undefined ? `AJV Error: ${message}` : 'AJV Error'
    super(message)
  }
}
