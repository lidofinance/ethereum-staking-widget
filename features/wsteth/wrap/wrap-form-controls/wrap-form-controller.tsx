import { FormController } from 'features/wsteth/shared/components/form-controller';
import { useWrapFormData } from '../wrap-form-context';

export const WrapFormController: React.FC = ({ children }) => {
  const { onSubmit } = useWrapFormData();
  return <FormController onSubmit={onSubmit}>{children}</FormController>;
};
