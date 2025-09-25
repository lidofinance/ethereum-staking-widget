import { promises as fs } from 'fs';

export const VALIDATION_FILE_PATH = process.env.VALIDATION_FILE_PATH;

// Safely initialize a global variable
const globalStartupValidationFileChecks = globalThis.__startupValidationFileChecks || {
  promise: null,
};
globalThis.__startupValidationFileChecks = globalStartupValidationFileChecks;

const isValidValidationFile = (data) => {
  return (
    typeof data === 'object' &&
    data !== null &&
    'addresses' in data &&
    Array.isArray(data.addresses) &&
    data.addresses.every((addr) => typeof addr === 'string')
  );
};

const checkValidationFile = async (filePath) => {
  try {
    console.info(`[checkValidationFile] Checking validation file: ${filePath}`);
    
    // Check if file exists and is readable
    const stats = await fs.stat(filePath);
    if (!stats.isFile()) {
      throw new Error(`Path exists but is not a file: ${filePath}`);
    }

    // Read file content
    const raw = await fs.readFile(filePath, 'utf8');
    
    // Handle empty files (valid case)
    if (raw.trim() === '') {
      console.info('[checkValidationFile] Empty validation file - treating as valid with no addresses');
      return { success: true, addresses: [] };
    }

    // Parse JSON
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (parseError) {
      throw new Error(`Invalid JSON format: ${parseError.message}`);
    }

    // Validate structure
    if (!isValidValidationFile(parsed)) {
      console.error('[checkValidationFile] Invalid validation file format. Expected: { addresses: string[] }');
      throw new Error('Invalid validation file format. Expected: { addresses: string[] }');
    }

    console.info(`[checkValidationFile] Validation file is valid with ${parsed.addresses.length} addresses`);
    return { success: true, addresses: parsed.addresses };

  } catch (error) {
    console.error(`[checkValidationFile] Validation file check failed: ${error.message}`);
    return { success: false, error: error.message };
  }
};

export const getValidationFileChecks = () => globalStartupValidationFileChecks.promise;

export const startupCheckValidationFile = async () => {
  console.info('[startupCheckValidationFile] Starting validation file checks...');

  if (globalStartupValidationFileChecks.promise) {
    return globalStartupValidationFileChecks.promise;
  }

  globalStartupValidationFileChecks.promise = (async () => {
    try {
      // If no validation file path is specified or empty, skip check
      if (!VALIDATION_FILE_PATH || VALIDATION_FILE_PATH.trim() === '') {
        console.info('[startupCheckValidationFile] No VALIDATION_FILE_PATH specified - skipping validation file check');
        return { success: true, skipped: true };
      }

      const result = await checkValidationFile(VALIDATION_FILE_PATH);
      
      if (!result.success) {
        throw new Error(`Validation file check failed: ${result.error}`);
      }

      return result;
      
    } catch (error) {
      console.error('[startupCheckValidationFile] Critical error during validation file check:', error.message);
      process.exit(1);
    }
  })();

  return globalStartupValidationFileChecks.promise;
};
