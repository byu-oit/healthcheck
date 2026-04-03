import { Type } from '@sinclair/typebox'
import { Validator, TypeCheckError } from '../src/validator'

test('validator returns parsed data when the schema matches', () => {
  const validator = new Validator(Type.Object({
    name: Type.String()
  }))

  expect(validator.parse({ name: 'healthcheck' })).toEqual({ name: 'healthcheck' })
})

test('validator throws a typed error with a default message when validation fails', () => {
  const validator = new Validator(Type.Object({
    name: Type.String()
  }))

  expect(() => validator.parse({ name: 1 })).toThrow(TypeCheckError)
  expect(() => validator.parse({ name: 1 })).toThrow('TypeCheck Error')
})

test('validator supports a custom parse error message', () => {
  const validator = new Validator(Type.Object({
    name: Type.String()
  }))

  try {
    validator.parse({ name: 1 }, 'invalid payload')
    fail('Expected validator.parse to throw')
  } catch (error) {
    expect(error).toBeInstanceOf(TypeCheckError)
    expect((error as TypeCheckError).message).toBe('TypeCheck Error: invalid payload')
    expect((error as TypeCheckError).validations.length).toBeGreaterThan(0)
  }
})
