import { Check } from '../check'
import { Components } from '../healthcheck'

export type Executor<Args extends unknown[] = unknown[]> = (this: Check<Args>, ...args: Args) => Promise<Components>
