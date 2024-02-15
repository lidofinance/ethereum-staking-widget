import { RequestItem } from './request-item';
import { RequestsEmpty } from './requests-empty';
import { Wrapper } from './styles';
import { RequestsLoader } from './requests-loader';
import { useFieldArray, useFormContext, useFormState } from 'react-hook-form';
import { ClaimFormInputType } from '../../claim-form-context';
import { useWeb3 } from 'reef-knot/web3-react';

export const RequestsList: React.FC = () => {
  const { active } = useWeb3();
  const { isLoading } = useFormState<ClaimFormInputType>();
  const { register } = useFormContext<ClaimFormInputType>();
  const { fields } = useFieldArray<ClaimFormInputType, 'requests'>({
    name: 'requests',
  });

  if (isLoading) {
    return <RequestsLoader />;
  }

  if (!active || fields.length === 0) {
    return <RequestsEmpty isWalletConnected={active} />;
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
