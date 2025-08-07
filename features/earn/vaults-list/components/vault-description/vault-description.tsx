import { VaultDescriptionWrapper } from './styles';

export const VaultDescription: React.FC<{ description?: string }> = ({
  description,
}) => {
  return (
    <VaultDescriptionWrapper>
      {description && <p>{description}</p>}
    </VaultDescriptionWrapper>
  );
};
