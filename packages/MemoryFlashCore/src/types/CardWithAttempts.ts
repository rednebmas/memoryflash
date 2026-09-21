import { Attempt } from './Attempt';
import { Card } from './Cards';

export type CardWithAttempts = Card & { attempts: Attempt[]; hidden?: boolean };
