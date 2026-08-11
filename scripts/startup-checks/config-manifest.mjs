import { promises as fs } from 'fs';

export const CONFIG_MANIFEST_PATH = process.env.CONFIG_MANIFEST_PATH;

// Safely initialize a global variable
const globalStartupManifestFileChecks = globalThis.__startupManifestFileChecks || {
  promise: null,
};
globalThis.__startupManifestFileChecks = globalStartupManifestFileChecks;

// core invariants of ManifestSchema (config/external-config/validate.ts);
// full zod validation happens in fetch-external-manifest
const MANIFEST_KEY_REGEX = /^[1-9]\d*(?:-.+)?$/;

const isPlainObject = (value) =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

// returns an error message or null
export const validateManifest = (data) => {
  if (!isPlainObject(data)) {
    return 'manifest must be a non-array object';
  }
  if (!isPlainObject(data.baseConfig)) {
    return 'a baseConfig object is required';
  }
  const chainKeys = Object.keys(data).filter((key) =>
    MANIFEST_KEY_REGEX.test(key),
  );
  if (chainKeys.length === 0) {
    return 'at least one chain-keyed entry is required';
  }
  for (const key of chainKeys) {
    const entry = data[key];
    if (!isPlainObject(entry) || typeof entry.leastSafeVersion !== 'string') {
      return `entry "${key}" must be an object with a string leastSafeVersion`;
    }
  }
  return null;
};

const checkManifestFile = async (filePath) => {
  try {
    console.info(`[checkManifestFile] Checking manifest file: ${filePath}`);

    // Check if file exists and is readable
    const stats = await fs.stat(filePath);
    if (!stats.isFile()) {
      throw new Error(`Path exists but is not a file: ${filePath}`);
    }

    // Read file content
    const raw = await fs.readFile(filePath, 'utf-8');

    // Parse JSON
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (parseError) {
      throw new Error(`Invalid JSON format: ${parseError.message}`);
    }

    // Validate structure
    const validationError = validateManifest(parsed);
    if (validationError) {
      throw new Error(`Invalid manifest format: ${validationError}`);
    }

    console.info(
      `[checkManifestFile] Manifest file is valid with keys: ${Object.keys(parsed).join(', ')}`,
    );
    return { success: true };
  } catch (error) {
    console.error(`[checkManifestFile] Manifest file check failed: ${error.message}`);
    return { success: false, error: error.message };
  }
};

export const getManifestFileChecks = () => globalStartupManifestFileChecks.promise;

export const startupCheckManifestFile = async () => {
  console.info('[startupCheckManifestFile] Starting manifest file checks...');

  if (globalStartupManifestFileChecks.promise) {
    return globalStartupManifestFileChecks.promise;
  }

  globalStartupManifestFileChecks.promise = (async () => {
    try {
      // If no manifest file path is specified, skip check
      if (!CONFIG_MANIFEST_PATH || CONFIG_MANIFEST_PATH.trim() === '') {
        console.info(
          '[startupCheckManifestFile] No CONFIG_MANIFEST_PATH specified - skipping manifest file check',
        );
        return { success: true, skipped: true };
      }

      const result = await checkManifestFile(CONFIG_MANIFEST_PATH);

      if (!result.success) {
        throw new Error(`Manifest file check failed: ${result.error}`);
      }

      return result;
    } catch (error) {
      console.error(
        '[startupCheckManifestFile] Critical error during manifest file check:',
        error.message,
      );
      // Exit process to prevent build/start if the manifest file is invalid
      process.exit(1);
    }
  })();

  return globalStartupManifestFileChecks.promise;
};
