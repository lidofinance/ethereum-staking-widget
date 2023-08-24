import { FormController } from 'features/wsteth/shared/components/form-controller';
import { useUnwrapFormData } from '../unwrap-form-context';

export const UnwrapFormController: React.FC = ({ children }) => {
  const { onSubmit } = useUnwrapFormData();
  return <FormController onSubmit={onSubmit}>{children}</FormController>;
};
