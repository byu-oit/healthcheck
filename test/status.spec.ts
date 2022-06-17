import * as Status from '../src/status'

describe('convert status text to number', () => {
  test.concurrent.each([
    [Status.Text.PASS, Status.Num.PASS],
    [Status.Text.WARN, Status.Num.WARN],
    [Status.Text.FAIL, Status.Num.FAIL],
  ])('converts %s to %d', (input, output) => {
    expect(Status.toNum(input)).toEqual(output)
  })
})

describe('convert status number to text', () => {
  test.concurrent.each([
    [Status.Num.PASS, Status.Text.PASS],
    [Status.Num.WARN, Status.Text.WARN],
    [Status.Num.FAIL, Status.Text.FAIL],
  ])('converts %d to %s', (input, output) => {
    expect(Status.toText(input)).toEqual(output)
  })
})
