import styled from 'styled-components';
import { useFormState } from 'react-hook-form';
import { InputGroup } from '@lidofinance/lido-ui';
import { isValidationErrorTypeValidate } from 'shared/hook-form/validation/validation-error';

type InputGroupProps = React.ComponentProps<typeof InputGroup>;

type InputGroupStyleProps = {
  success?: InputGroupProps['success'];
  bottomSpacing?: boolean;
};

type InputGroupHookFormProps = InputGroupProps &
  InputGroupStyleProps & {
    errorField: string;
  };

const InputGroupStyled = styled(InputGroup)<InputGroupStyleProps>`
  margin-bottom: ${({ theme, bottomSpacing }) =>
    bottomSpacing ? theme.spaceMap.md : 0}px;
  z-index: 2;
  span:nth-of-type(2) {
    white-space: ${({ success }) => !!success && 'unset'};
  }
`;

export const InputGroupHookForm: React.FC<InputGroupHookFormProps> = ({
  errorField,
  bottomSpacing = true,
  ...props
}) => {
  const { errors } = useFormState<Record<string, unknown>>({
    name: errorField,
  });
  const errorMessage =
    isValidationErrorTypeValidate(errors[errorField]?.type) &&
    errors[errorField]?.message;
  return (
    <InputGroupStyled
      bottomSpacing={bottomSpacing}
      fullwidth
      error={errorMessage}
      {...props}
    />
  );
};
