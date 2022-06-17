export enum Text {
  PASS = 'pass',
  FAIL = 'fail',
  WARN = 'warn'
}

export enum Num {
  PASS = 0,
  WARN = 1,
  FAIL = 2
}

export function toNum (status: Text): Num {
  const map: Record<Text, Num> = {
    [Text.PASS]: Num.PASS,
    [Text.WARN]: Num.WARN,
    [Text.FAIL]: Num.FAIL
  }
  return map[status]
}

export function toText (status: Num): Text {
  const map: Record<Num, Text> = {
    [Num.PASS]: Text.PASS,
    [Num.WARN]: Text.WARN,
    [Num.FAIL]: Text.FAIL
  }
  return map[status]
}
