import styled from 'styled-components';
import { useFormState } from 'react-hook-form';
import { InputGroup } from '@lidofinance/lido-ui';
import { isValidationErrorTypeDefault } from 'shared/hook-form/validation/validation-error';

type InputGroupProps = React.ComponentProps<typeof InputGroup>;

type InputGroupHookFormProps = InputGroupProps & {
  fieldName: string;
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
  fieldName,
  ...props
}) => {
  const { errors } = useFormState<Record<string, unknown>>({ name: fieldName });
  const errorMessage =
    isValidationErrorTypeDefault(errors[fieldName]?.type) &&
    errors[fieldName]?.message;
  return <InputGroupStyled fullwidth error={errorMessage} {...props} />;
};
