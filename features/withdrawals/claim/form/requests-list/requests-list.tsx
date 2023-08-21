import { RequestItem } from './request-item';
import { RequestsEmpty } from './requests-empty';
import { Wrapper } from './styles';
import { RequestsLoader } from './requests-loader';
import { useFieldArray, useFormContext, useFormState } from 'react-hook-form';
import { ClaimFormInputType } from '../../claim-form-context';

export const RequestsList: React.FC = () => {
  const { isLoading } = useFormState<ClaimFormInputType>();
  const { register } = useFormContext<ClaimFormInputType>();
  const { fields } = useFieldArray<ClaimFormInputType, 'requests'>({
    name: 'requests',
  });

  if (isLoading) {
    return <RequestsLoader />;
  }

  if (fields.length === 0) {
    return <RequestsEmpty />;
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
