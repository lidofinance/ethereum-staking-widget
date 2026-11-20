import type { TxFlowContext, TxStepStatus } from './types';

const RANK: Record<TxStepStatus, number> = {
  pending: 0,
  sent: 1,
  settled: 2,
  done: 3,
  proposed: 0,
};

const reached = (
  ctx: TxFlowContext<unknown>,
  stepId: string,
  status: TxStepStatus,
) => RANK[ctx.status[stepId] ?? 'pending'] >= RANK[status];

// the step reached the chain (and possibly went further)
export const isStepSent = (ctx: TxFlowContext<unknown>, stepId: string) =>
  reached(ctx, stepId, 'sent');

// the step's receipt is in with status success (DONE may have failed after)
export const isStepSettled = (ctx: TxFlowContext<unknown>, stepId: string) =>
  reached(ctx, stepId, 'settled');

export const isStepDone = (ctx: TxFlowContext<unknown>, stepId: string) =>
  reached(ctx, stepId, 'done');

export const isStepProposed = (ctx: TxFlowContext<unknown>, stepId: string) =>
  ctx.status[stepId] === 'proposed';
