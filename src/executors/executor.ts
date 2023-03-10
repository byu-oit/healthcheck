import type { Check } from '../check'
import type { Components } from '../schema'

export type Executor<Args extends unknown[] = unknown[]> = (this: Check<Args>, ...args: Args) => Promise<Components>
