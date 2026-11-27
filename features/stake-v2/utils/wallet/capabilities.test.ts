import { isAtomicBatchSupported, isContractCode } from './capabilities';

describe('isAtomicBatchSupported', () => {
  it('false without capabilities', () => {
    expect(isAtomicBatchSupported(undefined, 1)).toBe(false);
  });

  it('per chain, with chain 0 applying everywhere', () => {
    const onBase = { 8453: { atomic: { status: 'supported' } } };
    expect(isAtomicBatchSupported(onBase, 8453)).toBe(true);
    expect(isAtomicBatchSupported(onBase, 1)).toBe(false);
    const everywhere = { 0: { atomic: { status: 'supported' } } };
    expect(isAtomicBatchSupported(everywhere, 1)).toBe(true);
  });

  it('a chain entry overrides chain 0', () => {
    const caps = {
      0: { atomic: { status: 'supported' } },
      1: { atomic: { status: 'unsupported' } },
    };
    expect(isAtomicBatchSupported(caps, 1)).toBe(false);
  });

  it('reads the legacy atomicBatch form', () => {
    expect(
      isAtomicBatchSupported({ 1: { atomicBatch: { supported: true } } }, 1),
    ).toBe(true);
  });

  it('"ready" is not yet supported', () => {
    expect(
      isAtomicBatchSupported({ 1: { atomic: { status: 'ready' } } }, 1),
    ).toBe(false);
  });
});

describe('isContractCode', () => {
  it('EOAs and delegated EOAs are not contracts', () => {
    expect(isContractCode(undefined)).toBe(false);
    expect(isContractCode('0x')).toBe(false);
    expect(
      isContractCode('0xef0100aabbccddeeff00112233445566778899aabbccdd'),
    ).toBe(false);
  });

  it('any other code is', () => {
    expect(isContractCode('0x6080604052')).toBe(true);
  });
});
