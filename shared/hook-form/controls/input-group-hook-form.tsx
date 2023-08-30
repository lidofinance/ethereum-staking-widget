import styled from 'styled-components';
import { useFormState } from 'react-hook-form';
import { InputGroup } from '@lidofinance/lido-ui';
import { isValidationErrorTypeValidate } from 'shared/hook-form/validation/validation-error';

type InputGroupProps = React.ComponentProps<typeof InputGroup>;

type InputGroupHookFormProps = InputGroupProps & {
  errorField: string;
};

const InputGroupStyled = styled(InputGroup)<{
  success?: InputGroupProps['success'];
}>`
  margin-bottom: ${({ theme }) => theme.spaceMap.md}px;
  z-index: 2;
  span:nth-of-type(2) {
    white-space: ${({ success }) => !!success && 'unset'};
  }
`;

export const InputGroupHookForm: React.FC<InputGroupHookFormProps> = ({
  errorField,
  ...props
}) => {
  const { errors } = useFormState<Record<string, unknown>>({
    name: errorField,
  });
  const errorMessage =
    isValidationErrorTypeValidate(errors[errorField]?.type) &&
    errors[errorField]?.message;
  return <InputGroupStyled fullwidth error={errorMessage} {...props} />;
};
