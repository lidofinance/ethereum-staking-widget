import { useFieldArray, useFormContext, useFormState } from 'react-hook-form';
import { useDappStatus } from 'shared/hooks/use-dapp-status';

import { ClaimFormInputType } from '../../claim-form-context';
import { RequestItem } from './request-item';
import { RequestsEmpty } from './requests-empty';
import { Wrapper } from './styles';
import { RequestsLoader } from './requests-loader';

export const RequestsList: React.FC = () => {
  const { isWalletConnected, isDappActiveOnL1 } = useDappStatus();
  const { isLoading } = useFormState<ClaimFormInputType>();
  const { register } = useFormContext<ClaimFormInputType>();
  const { fields } = useFieldArray<ClaimFormInputType, 'requests'>({
    name: 'requests',
  });

  if (isLoading) {
    return <RequestsLoader />;
  }

  if (!isDappActiveOnL1 || fields.length === 0) {
    return (
      <RequestsEmpty
        isWalletConnected={isWalletConnected}
        isDappActive={isDappActiveOnL1}
      />
    );
  }

  return (
    <Wrapper>
      {fields.map(({ token_id, id }, index) => (
        <RequestItem
          key={id}
          index={index}
          token_id={token_id}
          {...register(`requests.${index}.checked`, { deps: 'requests' })}
        />
      ))}
    </Wrapper>
  );
};
