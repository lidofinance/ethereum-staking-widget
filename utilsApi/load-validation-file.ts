import { promises as fs } from 'fs';
import Metrics from 'utilsApi/metrics';
import { config } from 'config';

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
  const CONFIG_PATH = config.validationFilePath;

  console.info(`[loadValidationFile] CONFIG_PATH ${CONFIG_PATH}`);

  if (!CONFIG_PATH) {
    console.warn('[loadValidationFile] No validation file path provided');
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

    console.info(
      `[loadValidationFile] parsed with ${parsed.addresses.length} addresses`,
    );

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
