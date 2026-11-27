import { createPromptSlot } from './prompt-slot';

describe('createPromptSlot', () => {
  it('resolves with the answer', async () => {
    const slot = createPromptSlot();
    const { promise, settle } = slot.open<{ confirmed: boolean }>();
    settle({ confirmed: true });
    await expect(promise).resolves.toEqual({ confirmed: true });
  });

  it('closing resolves null', async () => {
    const slot = createPromptSlot();
    const { promise } = slot.open();
    slot.dismiss();
    await expect(promise).resolves.toBeNull();
  });

  it('a new question resolves the previous one null, whose answer is then ignored', async () => {
    const slot = createPromptSlot();
    const first = slot.open<number>();
    const second = slot.open<number>();
    first.settle(1);
    second.settle(2);
    await expect(first.promise).resolves.toBeNull();
    await expect(second.promise).resolves.toBe(2);
  });

  it('an answered question is not changed by a later close', async () => {
    const slot = createPromptSlot();
    const { promise, settle } = slot.open<number>();
    settle(1);
    slot.dismiss();
    await expect(promise).resolves.toBe(1);
  });
});
