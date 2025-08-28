import { promises as fs } from 'fs';
import Metrics from 'utilsApi/metrics';
import { config } from 'config';
import getConfigNext from 'next/config';

const { serverRuntimeConfig } = getConfigNext();

export interface AddressValidationFile {
  addresses: string[];
  isBroken?: boolean;
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

const getValidationFilePath = (): string | undefined => {
  return (
    process.env.VALIDATION_FILE_PATH ||
    config.validationFilePath ||
    serverRuntimeConfig.validationFilePath
  );
};

export const loadValidationFile = async (): Promise<AddressValidationFile> => {
  const CONFIG_PATH = getValidationFilePath();

  console.info(
    `[loadValidationFile] env VALIDATION_FILE_PATH: ${process.env.VALIDATION_FILE_PATH}`,
  );
  console.info(
    `[loadValidationFile] config validationFilePath: ${config.validationFilePath}`,
  );
  console.info(
    `[loadValidationFile] serverRuntimeConfig validationFilePath: ${serverRuntimeConfig.validationFilePath}`,
  );
  console.info(`[loadValidationFile] final CONFIG_PATH: ${CONFIG_PATH}`);

  if (!CONFIG_PATH) {
    console.warn(
      '[loadValidationFile] No validation file path provided in env or config',
    );
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

      return { addresses: [], isBroken: true };
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

    return { addresses: [], isBroken: true };
  }
};
