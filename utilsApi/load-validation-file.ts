import { promises as fs } from 'fs';

const CONFIG_PATH = process.env.VALIDATION_FILE_PATH;

export interface AddressValidationFile {
  addresses: string[];
}

export const loadValidationFile = async (): Promise<AddressValidationFile> => {
  if (!CONFIG_PATH) {
    return { addresses: [] };
  }

  const raw = await fs.readFile(CONFIG_PATH, 'utf8');
  return JSON.parse(raw) as AddressValidationFile;
};
