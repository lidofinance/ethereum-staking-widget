import type {
  EVENT_SCHEMA,
  REWARD_EVENT_SCHEMA,
  TRANSFER_EVENT_SCHEMA,
} from '../fetchers/backend';
import type { z } from 'zod';

export type RewardEvent = z.infer<typeof REWARD_EVENT_SCHEMA>;
export type TransferEvent = z.infer<typeof TRANSFER_EVENT_SCHEMA>;

export type Event = z.infer<typeof EVENT_SCHEMA>;
export type EventType = Event['type'];
