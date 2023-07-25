import { useController } from 'react-hook-form';
import { RequestFormInputType } from '../../request-form-context';
import { OptionsPicker } from '../options/options-picker';

export const ModeInput = () => {
  const { field } = useController<RequestFormInputType, 'mode'>({
    name: 'mode',
  });
  return (
    <OptionsPicker
      selectedOption={field.value}
      onOptionSelect={(value) => {
        field.onChange(value);
        field.onBlur();
      }}
    />
  );
};
