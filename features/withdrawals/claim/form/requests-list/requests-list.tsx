import { useFieldArray, useFormContext, useFormState } from 'react-hook-form';
import { useDappStatus } from 'modules/web3';

import { ClaimFormInputType } from '../../claim-form-context';
import { RequestItem } from './request-item';
import { RequestsEmpty } from './requests-empty';
import { Wrapper } from './styles';
import { RequestsLoader } from './requests-loader';

export const RequestsList: React.FC = () => {
  const { isDappActive } = useDappStatus();
  const { isLoading } = useFormState<ClaimFormInputType>();
  const { register } = useFormContext<ClaimFormInputType>();
  const { fields } = useFieldArray<ClaimFormInputType, 'requests'>({
    name: 'requests',
  });

  if (!isDappActive || (fields.length === 0 && !isLoading)) {
    return <RequestsEmpty />;
  }

  if (isLoading) {
    return <RequestsLoader />;
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
