import { promises as fs } from 'fs';
import Metrics from 'utilsApi/metrics';

const CONFIG_PATH = process.env.VALIDATION_FILE_PATH;

export interface AddressValidationFile {
  addresses: string[];
  isBrocken?: boolean;
}

const isValidValidationFile = (
  data: unknown,
): data is AddressValidationFile => {
  return (
    typeof data === 'object' &&
    data !== null &&
    'addresses' in data &&
    Array.isArray(data.addresses) &&
    data.addresses.every((addr) => typeof addr === 'string')
  );
};

export const loadValidationFile = async (): Promise<AddressValidationFile> => {
  if (!CONFIG_PATH) {
    return { addresses: [] };
  }

  try {
    const raw = await fs.readFile(CONFIG_PATH, 'utf8');

    // Skip validation for empty files
    if (raw.trim() === '') {
      return { addresses: [] };
    }

    const parsed = JSON.parse(raw);

    if (!isValidValidationFile(parsed)) {
      console.error(
        '[loadValidationFile] Invalid validation file format. Expected: { addresses: string[] }',
      );
      Metrics.request.validationFileLoadError
        .labels({ error: 'invalid_format' })
        .inc(1);

      return { addresses: [] };
    }

    return parsed;
  } catch (error) {
    console.error(
      '[loadValidationFile] Failed to load validation file:',
      error,
    );
    Metrics.request.validationFileLoadError
      .labels({ error: String(error) })
      .inc(1);

    return { addresses: [], isBrocken: true };
  }
};
