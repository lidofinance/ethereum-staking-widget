import { FormStyled } from 'features/wsteth/shared/styles';
import { useWrapFormData } from '../wrap-form-context';

export const FormControlled: React.FC = ({ children }) => {
  const { onSubmit } = useWrapFormData();

  return (
    <FormStyled autoComplete="off" onSubmit={onSubmit}>
      {children}
    </FormStyled>
  );
};
