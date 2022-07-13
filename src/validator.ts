import { TypeCompiler, TypeCheck, ValueError } from '@sinclair/typebox/compiler'
import { Static, TSchema } from '@sinclair/typebox'

export class Validator<T extends TSchema> {
  protected readonly validator: TypeCheck<T>
  constructor (
    public readonly schema: T,
    public readonly references?: TSchema[]
  ) {
    this.validator = TypeCompiler.Compile(schema, references)
  }

  parse (data: unknown, errorMessage?: string): Static<T> {
    const value = this.validator.Check(data)
    if (!value) {
      throw new TypeCheckError([...this.validator.Errors(value)], errorMessage)
    }
    return data
  }
}

export class TypeCheckError extends Error {
  constructor (public readonly validations: ValueError[], message?: string) {
    message = message !== undefined ? `TypeCheck Error: ${message}` : 'TypeCheck Error'
    super(message)
  }
}
