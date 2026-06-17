import { InputGroupHookForm } from 'shared/hook-form/controls/input-group-hook-form';

// Reserves space for the validation error banner (38px = its height + gaps)
// so layout doesn't shift when the error appears/disappears.
const INPUT_BOTTOM_SPACING = 38;

type Props = React.ComponentProps<typeof InputGroupHookForm>;

export const VaultInputGroupHookForm: React.FC<Props> = (props) => (
  <InputGroupHookForm bottomSpacing={INPUT_BOTTOM_SPACING} {...props} />
);
