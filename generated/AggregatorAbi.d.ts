/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import {
  ethers,
  EventFilter,
  Signer,
  BigNumber,
  BigNumberish,
  PopulatedTransaction,
  BaseContract,
  ContractTransaction,
  Overrides,
  CallOverrides,
} from 'ethers';
import { BytesLike } from '@ethersproject/bytes';
import { Listener, Provider } from '@ethersproject/providers';
import { FunctionFragment, EventFragment, Result } from '@ethersproject/abi';
import { TypedEventFilter, TypedEvent, TypedListener } from './commons';

interface AggregatorAbiInterface extends ethers.utils.Interface {
  functions: {
    'acceptOwnership()': FunctionFragment;
    'accessController()': FunctionFragment;
    'aggregator()': FunctionFragment;
    'confirmAggregator(address)': FunctionFragment;
    'decimals()': FunctionFragment;
    'description()': FunctionFragment;
    'getAnswer(uint256)': FunctionFragment;
    'getRoundData(uint80)': FunctionFragment;
    'getTimestamp(uint256)': FunctionFragment;
    'latestAnswer()': FunctionFragment;
    'latestRound()': FunctionFragment;
    'latestRoundData()': FunctionFragment;
    'latestTimestamp()': FunctionFragment;
    'owner()': FunctionFragment;
    'phaseAggregators(uint16)': FunctionFragment;
    'phaseId()': FunctionFragment;
    'proposeAggregator(address)': FunctionFragment;
    'proposedAggregator()': FunctionFragment;
    'proposedGetRoundData(uint80)': FunctionFragment;
    'proposedLatestRoundData()': FunctionFragment;
    'setController(address)': FunctionFragment;
    'transferOwnership(address)': FunctionFragment;
    'version()': FunctionFragment;
  };

  encodeFunctionData(
    functionFragment: 'acceptOwnership',
    values?: undefined,
  ): string;
  encodeFunctionData(
    functionFragment: 'accessController',
    values?: undefined,
  ): string;
  encodeFunctionData(
    functionFragment: 'aggregator',
    values?: undefined,
  ): string;
  encodeFunctionData(
    functionFragment: 'confirmAggregator',
    values: [string],
  ): string;
  encodeFunctionData(functionFragment: 'decimals', values?: undefined): string;
  encodeFunctionData(
    functionFragment: 'description',
    values?: undefined,
  ): string;
  encodeFunctionData(
    functionFragment: 'getAnswer',
    values: [BigNumberish],
  ): string;
  encodeFunctionData(
    functionFragment: 'getRoundData',
    values: [BigNumberish],
  ): string;
  encodeFunctionData(
    functionFragment: 'getTimestamp',
    values: [BigNumberish],
  ): string;
  encodeFunctionData(
    functionFragment: 'latestAnswer',
    values?: undefined,
  ): string;
  encodeFunctionData(
    functionFragment: 'latestRound',
    values?: undefined,
  ): string;
  encodeFunctionData(
    functionFragment: 'latestRoundData',
    values?: undefined,
  ): string;
  encodeFunctionData(
    functionFragment: 'latestTimestamp',
    values?: undefined,
  ): string;
  encodeFunctionData(functionFragment: 'owner', values?: undefined): string;
  encodeFunctionData(
    functionFragment: 'phaseAggregators',
    values: [BigNumberish],
  ): string;
  encodeFunctionData(functionFragment: 'phaseId', values?: undefined): string;
  encodeFunctionData(
    functionFragment: 'proposeAggregator',
    values: [string],
  ): string;
  encodeFunctionData(
    functionFragment: 'proposedAggregator',
    values?: undefined,
  ): string;
  encodeFunctionData(
    functionFragment: 'proposedGetRoundData',
    values: [BigNumberish],
  ): string;
  encodeFunctionData(
    functionFragment: 'proposedLatestRoundData',
    values?: undefined,
  ): string;
  encodeFunctionData(
    functionFragment: 'setController',
    values: [string],
  ): string;
  encodeFunctionData(
    functionFragment: 'transferOwnership',
    values: [string],
  ): string;
  encodeFunctionData(functionFragment: 'version', values?: undefined): string;

  decodeFunctionResult(
    functionFragment: 'acceptOwnership',
    data: BytesLike,
  ): Result;
  decodeFunctionResult(
    functionFragment: 'accessController',
    data: BytesLike,
  ): Result;
  decodeFunctionResult(functionFragment: 'aggregator', data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: 'confirmAggregator',
    data: BytesLike,
  ): Result;
  decodeFunctionResult(functionFragment: 'decimals', data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: 'description',
    data: BytesLike,
  ): Result;
  decodeFunctionResult(functionFragment: 'getAnswer', data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: 'getRoundData',
    data: BytesLike,
  ): Result;
  decodeFunctionResult(
    functionFragment: 'getTimestamp',
    data: BytesLike,
  ): Result;
  decodeFunctionResult(
    functionFragment: 'latestAnswer',
    data: BytesLike,
  ): Result;
  decodeFunctionResult(
    functionFragment: 'latestRound',
    data: BytesLike,
  ): Result;
  decodeFunctionResult(
    functionFragment: 'latestRoundData',
    data: BytesLike,
  ): Result;
  decodeFunctionResult(
    functionFragment: 'latestTimestamp',
    data: BytesLike,
  ): Result;
  decodeFunctionResult(functionFragment: 'owner', data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: 'phaseAggregators',
    data: BytesLike,
  ): Result;
  decodeFunctionResult(functionFragment: 'phaseId', data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: 'proposeAggregator',
    data: BytesLike,
  ): Result;
  decodeFunctionResult(
    functionFragment: 'proposedAggregator',
    data: BytesLike,
  ): Result;
  decodeFunctionResult(
    functionFragment: 'proposedGetRoundData',
    data: BytesLike,
  ): Result;
  decodeFunctionResult(
    functionFragment: 'proposedLatestRoundData',
    data: BytesLike,
  ): Result;
  decodeFunctionResult(
    functionFragment: 'setController',
    data: BytesLike,
  ): Result;
  decodeFunctionResult(
    functionFragment: 'transferOwnership',
    data: BytesLike,
  ): Result;
  decodeFunctionResult(functionFragment: 'version', data: BytesLike): Result;

  events: {
    'AnswerUpdated(int256,uint256,uint256)': EventFragment;
    'NewRound(uint256,address,uint256)': EventFragment;
    'OwnershipTransferRequested(address,address)': EventFragment;
    'OwnershipTransferred(address,address)': EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: 'AnswerUpdated'): EventFragment;
  getEvent(nameOrSignatureOrTopic: 'NewRound'): EventFragment;
  getEvent(nameOrSignatureOrTopic: 'OwnershipTransferRequested'): EventFragment;
  getEvent(nameOrSignatureOrTopic: 'OwnershipTransferred'): EventFragment;
}

export class AggregatorAbi extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  listeners<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter?: TypedEventFilter<EventArgsArray, EventArgsObject>,
  ): Array<TypedListener<EventArgsArray, EventArgsObject>>;
  off<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>,
  ): this;
  on<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>,
  ): this;
  once<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>,
  ): this;
  removeListener<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>,
  ): this;
  removeAllListeners<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
  ): this;

  listeners(eventName?: string): Array<Listener>;
  off(eventName: string, listener: Listener): this;
  on(eventName: string, listener: Listener): this;
  once(eventName: string, listener: Listener): this;
  removeListener(eventName: string, listener: Listener): this;
  removeAllListeners(eventName?: string): this;

  queryFilter<EventArgsArray extends Array<any>, EventArgsObject>(
    event: TypedEventFilter<EventArgsArray, EventArgsObject>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined,
  ): Promise<Array<TypedEvent<EventArgsArray & EventArgsObject>>>;

  interface: AggregatorAbiInterface;

  functions: {
    acceptOwnership(
      overrides?: Overrides & { from?: string | Promise<string> },
    ): Promise<ContractTransaction>;

    accessController(overrides?: CallOverrides): Promise<[string]>;

    aggregator(overrides?: CallOverrides): Promise<[string]>;

    confirmAggregator(
      _aggregator: string,
      overrides?: Overrides & { from?: string | Promise<string> },
    ): Promise<ContractTransaction>;

    decimals(overrides?: CallOverrides): Promise<[number]>;

    description(overrides?: CallOverrides): Promise<[string]>;

    getAnswer(
      _roundId: BigNumberish,
      overrides?: CallOverrides,
    ): Promise<[BigNumber]>;

    getRoundData(
      _roundId: BigNumberish,
      overrides?: CallOverrides,
    ): Promise<
      [BigNumber, BigNumber, BigNumber, BigNumber, BigNumber] & {
        roundId: BigNumber;
        answer: BigNumber;
        startedAt: BigNumber;
        updatedAt: BigNumber;
        answeredInRound: BigNumber;
      }
    >;

    getTimestamp(
      _roundId: BigNumberish,
      overrides?: CallOverrides,
    ): Promise<[BigNumber]>;

    latestAnswer(overrides?: CallOverrides): Promise<[BigNumber]>;

    latestRound(overrides?: CallOverrides): Promise<[BigNumber]>;

    latestRoundData(overrides?: CallOverrides): Promise<
      [BigNumber, BigNumber, BigNumber, BigNumber, BigNumber] & {
        roundId: BigNumber;
        answer: BigNumber;
        startedAt: BigNumber;
        updatedAt: BigNumber;
        answeredInRound: BigNumber;
      }
    >;

    latestTimestamp(overrides?: CallOverrides): Promise<[BigNumber]>;

    owner(overrides?: CallOverrides): Promise<[string]>;

    phaseAggregators(
      arg0: BigNumberish,
      overrides?: CallOverrides,
    ): Promise<[string]>;

    phaseId(overrides?: CallOverrides): Promise<[number]>;

    proposeAggregator(
      _aggregator: string,
      overrides?: Overrides & { from?: string | Promise<string> },
    ): Promise<ContractTransaction>;

    proposedAggregator(overrides?: CallOverrides): Promise<[string]>;

    proposedGetRoundData(
      _roundId: BigNumberish,
      overrides?: CallOverrides,
    ): Promise<
      [BigNumber, BigNumber, BigNumber, BigNumber, BigNumber] & {
        roundId: BigNumber;
        answer: BigNumber;
        startedAt: BigNumber;
        updatedAt: BigNumber;
        answeredInRound: BigNumber;
      }
    >;

    proposedLatestRoundData(overrides?: CallOverrides): Promise<
      [BigNumber, BigNumber, BigNumber, BigNumber, BigNumber] & {
        roundId: BigNumber;
        answer: BigNumber;
        startedAt: BigNumber;
        updatedAt: BigNumber;
        answeredInRound: BigNumber;
      }
    >;

    setController(
      _accessController: string,
      overrides?: Overrides & { from?: string | Promise<string> },
    ): Promise<ContractTransaction>;

    transferOwnership(
      _to: string,
      overrides?: Overrides & { from?: string | Promise<string> },
    ): Promise<ContractTransaction>;

    version(overrides?: CallOverrides): Promise<[BigNumber]>;
  };

  acceptOwnership(
    overrides?: Overrides & { from?: string | Promise<string> },
  ): Promise<ContractTransaction>;

  accessController(overrides?: CallOverrides): Promise<string>;

  aggregator(overrides?: CallOverrides): Promise<string>;

  confirmAggregator(
    _aggregator: string,
    overrides?: Overrides & { from?: string | Promise<string> },
  ): Promise<ContractTransaction>;

  decimals(overrides?: CallOverrides): Promise<number>;

  description(overrides?: CallOverrides): Promise<string>;

  getAnswer(
    _roundId: BigNumberish,
    overrides?: CallOverrides,
  ): Promise<BigNumber>;

  getRoundData(
    _roundId: BigNumberish,
    overrides?: CallOverrides,
  ): Promise<
    [BigNumber, BigNumber, BigNumber, BigNumber, BigNumber] & {
      roundId: BigNumber;
      answer: BigNumber;
      startedAt: BigNumber;
      updatedAt: BigNumber;
      answeredInRound: BigNumber;
    }
  >;

  getTimestamp(
    _roundId: BigNumberish,
    overrides?: CallOverrides,
  ): Promise<BigNumber>;

  latestAnswer(overrides?: CallOverrides): Promise<BigNumber>;

  latestRound(overrides?: CallOverrides): Promise<BigNumber>;

  latestRoundData(overrides?: CallOverrides): Promise<
    [BigNumber, BigNumber, BigNumber, BigNumber, BigNumber] & {
      roundId: BigNumber;
      answer: BigNumber;
      startedAt: BigNumber;
      updatedAt: BigNumber;
      answeredInRound: BigNumber;
    }
  >;

  latestTimestamp(overrides?: CallOverrides): Promise<BigNumber>;

  owner(overrides?: CallOverrides): Promise<string>;

  phaseAggregators(
    arg0: BigNumberish,
    overrides?: CallOverrides,
  ): Promise<string>;

  phaseId(overrides?: CallOverrides): Promise<number>;

  proposeAggregator(
    _aggregator: string,
    overrides?: Overrides & { from?: string | Promise<string> },
  ): Promise<ContractTransaction>;

  proposedAggregator(overrides?: CallOverrides): Promise<string>;

  proposedGetRoundData(
    _roundId: BigNumberish,
    overrides?: CallOverrides,
  ): Promise<
    [BigNumber, BigNumber, BigNumber, BigNumber, BigNumber] & {
      roundId: BigNumber;
      answer: BigNumber;
      startedAt: BigNumber;
      updatedAt: BigNumber;
      answeredInRound: BigNumber;
    }
  >;

  proposedLatestRoundData(overrides?: CallOverrides): Promise<
    [BigNumber, BigNumber, BigNumber, BigNumber, BigNumber] & {
      roundId: BigNumber;
      answer: BigNumber;
      startedAt: BigNumber;
      updatedAt: BigNumber;
      answeredInRound: BigNumber;
    }
  >;

  setController(
    _accessController: string,
    overrides?: Overrides & { from?: string | Promise<string> },
  ): Promise<ContractTransaction>;

  transferOwnership(
    _to: string,
    overrides?: Overrides & { from?: string | Promise<string> },
  ): Promise<ContractTransaction>;

  version(overrides?: CallOverrides): Promise<BigNumber>;

  callStatic: {
    acceptOwnership(overrides?: CallOverrides): Promise<void>;

    accessController(overrides?: CallOverrides): Promise<string>;

    aggregator(overrides?: CallOverrides): Promise<string>;

    confirmAggregator(
      _aggregator: string,
      overrides?: CallOverrides,
    ): Promise<void>;

    decimals(overrides?: CallOverrides): Promise<number>;

    description(overrides?: CallOverrides): Promise<string>;

    getAnswer(
      _roundId: BigNumberish,
      overrides?: CallOverrides,
    ): Promise<BigNumber>;

    getRoundData(
      _roundId: BigNumberish,
      overrides?: CallOverrides,
    ): Promise<
      [BigNumber, BigNumber, BigNumber, BigNumber, BigNumber] & {
        roundId: BigNumber;
        answer: BigNumber;
        startedAt: BigNumber;
        updatedAt: BigNumber;
        answeredInRound: BigNumber;
      }
    >;

    getTimestamp(
      _roundId: BigNumberish,
      overrides?: CallOverrides,
    ): Promise<BigNumber>;

    latestAnswer(overrides?: CallOverrides): Promise<BigNumber>;

    latestRound(overrides?: CallOverrides): Promise<BigNumber>;

    latestRoundData(overrides?: CallOverrides): Promise<
      [BigNumber, BigNumber, BigNumber, BigNumber, BigNumber] & {
        roundId: BigNumber;
        answer: BigNumber;
        startedAt: BigNumber;
        updatedAt: BigNumber;
        answeredInRound: BigNumber;
      }
    >;

    latestTimestamp(overrides?: CallOverrides): Promise<BigNumber>;

    owner(overrides?: CallOverrides): Promise<string>;

    phaseAggregators(
      arg0: BigNumberish,
      overrides?: CallOverrides,
    ): Promise<string>;

    phaseId(overrides?: CallOverrides): Promise<number>;

    proposeAggregator(
      _aggregator: string,
      overrides?: CallOverrides,
    ): Promise<void>;

    proposedAggregator(overrides?: CallOverrides): Promise<string>;

    proposedGetRoundData(
      _roundId: BigNumberish,
      overrides?: CallOverrides,
    ): Promise<
      [BigNumber, BigNumber, BigNumber, BigNumber, BigNumber] & {
        roundId: BigNumber;
        answer: BigNumber;
        startedAt: BigNumber;
        updatedAt: BigNumber;
        answeredInRound: BigNumber;
      }
    >;

    proposedLatestRoundData(overrides?: CallOverrides): Promise<
      [BigNumber, BigNumber, BigNumber, BigNumber, BigNumber] & {
        roundId: BigNumber;
        answer: BigNumber;
        startedAt: BigNumber;
        updatedAt: BigNumber;
        answeredInRound: BigNumber;
      }
    >;

    setController(
      _accessController: string,
      overrides?: CallOverrides,
    ): Promise<void>;

    transferOwnership(_to: string, overrides?: CallOverrides): Promise<void>;

    version(overrides?: CallOverrides): Promise<BigNumber>;
  };

  filters: {
    AnswerUpdated(
      current?: BigNumberish | null,
      roundId?: BigNumberish | null,
      updatedAt?: null,
    ): TypedEventFilter<
      [BigNumber, BigNumber, BigNumber],
      { current: BigNumber; roundId: BigNumber; updatedAt: BigNumber }
    >;

    NewRound(
      roundId?: BigNumberish | null,
      startedBy?: string | null,
      startedAt?: null,
    ): TypedEventFilter<
      [BigNumber, string, BigNumber],
      { roundId: BigNumber; startedBy: string; startedAt: BigNumber }
    >;

    OwnershipTransferRequested(
      from?: string | null,
      to?: string | null,
    ): TypedEventFilter<[string, string], { from: string; to: string }>;

    OwnershipTransferred(
      from?: string | null,
      to?: string | null,
    ): TypedEventFilter<[string, string], { from: string; to: string }>;
  };

  estimateGas: {
    acceptOwnership(
      overrides?: Overrides & { from?: string | Promise<string> },
    ): Promise<BigNumber>;

    accessController(overrides?: CallOverrides): Promise<BigNumber>;

    aggregator(overrides?: CallOverrides): Promise<BigNumber>;

    confirmAggregator(
      _aggregator: string,
      overrides?: Overrides & { from?: string | Promise<string> },
    ): Promise<BigNumber>;

    decimals(overrides?: CallOverrides): Promise<BigNumber>;

    description(overrides?: CallOverrides): Promise<BigNumber>;

    getAnswer(
      _roundId: BigNumberish,
      overrides?: CallOverrides,
    ): Promise<BigNumber>;

    getRoundData(
      _roundId: BigNumberish,
      overrides?: CallOverrides,
    ): Promise<BigNumber>;

    getTimestamp(
      _roundId: BigNumberish,
      overrides?: CallOverrides,
    ): Promise<BigNumber>;

    latestAnswer(overrides?: CallOverrides): Promise<BigNumber>;

    latestRound(overrides?: CallOverrides): Promise<BigNumber>;

    latestRoundData(overrides?: CallOverrides): Promise<BigNumber>;

    latestTimestamp(overrides?: CallOverrides): Promise<BigNumber>;

    owner(overrides?: CallOverrides): Promise<BigNumber>;

    phaseAggregators(
      arg0: BigNumberish,
      overrides?: CallOverrides,
    ): Promise<BigNumber>;

    phaseId(overrides?: CallOverrides): Promise<BigNumber>;

    proposeAggregator(
      _aggregator: string,
      overrides?: Overrides & { from?: string | Promise<string> },
    ): Promise<BigNumber>;

    proposedAggregator(overrides?: CallOverrides): Promise<BigNumber>;

    proposedGetRoundData(
      _roundId: BigNumberish,
      overrides?: CallOverrides,
    ): Promise<BigNumber>;

    proposedLatestRoundData(overrides?: CallOverrides): Promise<BigNumber>;

    setController(
      _accessController: string,
      overrides?: Overrides & { from?: string | Promise<string> },
    ): Promise<BigNumber>;

    transferOwnership(
      _to: string,
      overrides?: Overrides & { from?: string | Promise<string> },
    ): Promise<BigNumber>;

    version(overrides?: CallOverrides): Promise<BigNumber>;
  };

  populateTransaction: {
    acceptOwnership(
      overrides?: Overrides & { from?: string | Promise<string> },
    ): Promise<PopulatedTransaction>;

    accessController(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    aggregator(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    confirmAggregator(
      _aggregator: string,
      overrides?: Overrides & { from?: string | Promise<string> },
    ): Promise<PopulatedTransaction>;

    decimals(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    description(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    getAnswer(
      _roundId: BigNumberish,
      overrides?: CallOverrides,
    ): Promise<PopulatedTransaction>;

    getRoundData(
      _roundId: BigNumberish,
      overrides?: CallOverrides,
    ): Promise<PopulatedTransaction>;

    getTimestamp(
      _roundId: BigNumberish,
      overrides?: CallOverrides,
    ): Promise<PopulatedTransaction>;

    latestAnswer(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    latestRound(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    latestRoundData(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    latestTimestamp(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    owner(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    phaseAggregators(
      arg0: BigNumberish,
      overrides?: CallOverrides,
    ): Promise<PopulatedTransaction>;

    phaseId(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    proposeAggregator(
      _aggregator: string,
      overrides?: Overrides & { from?: string | Promise<string> },
    ): Promise<PopulatedTransaction>;

    proposedAggregator(
      overrides?: CallOverrides,
    ): Promise<PopulatedTransaction>;

    proposedGetRoundData(
      _roundId: BigNumberish,
      overrides?: CallOverrides,
    ): Promise<PopulatedTransaction>;

    proposedLatestRoundData(
      overrides?: CallOverrides,
    ): Promise<PopulatedTransaction>;

    setController(
      _accessController: string,
      overrides?: Overrides & { from?: string | Promise<string> },
    ): Promise<PopulatedTransaction>;

    transferOwnership(
      _to: string,
      overrides?: Overrides & { from?: string | Promise<string> },
    ): Promise<PopulatedTransaction>;

    version(overrides?: CallOverrides): Promise<PopulatedTransaction>;
  };
}
