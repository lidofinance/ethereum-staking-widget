import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const buildInfo = JSON.parse(
  readFileSync(path.join(__dirname, '../build-info.json'), 'utf-8'),
);

export default function generateBuildId() {
  const commit = buildInfo.commit;
  const buildId = commit === 'REPLACE_WITH_COMMIT' ? null : commit;
  console.info(
    buildId ? `Generated build id: ${buildId}` : 'Fallback to default build ID',
  );
  return buildId;
}
