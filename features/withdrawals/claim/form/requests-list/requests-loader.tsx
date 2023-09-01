import { Checkbox } from '@lidofinance/lido-ui';
import {
  WrapperLoader,
  RequestStyled,
  InlineLoaderStyled,
  REQUESTS_LIST_LOADERS_COUNT,
} from './styles';

const LOADERS_SIZE_ARRAY = Array.from({
  length: REQUESTS_LIST_LOADERS_COUNT,
}).fill(null);

export const RequestsLoader = () => {
  return (
    <WrapperLoader>
      {LOADERS_SIZE_ARRAY.map((_, i) => (
        <RequestStyled key={i} $loading>
          <Checkbox disabled />
          <InlineLoaderStyled />
        </RequestStyled>
      ))}
    </WrapperLoader>
  );
};
