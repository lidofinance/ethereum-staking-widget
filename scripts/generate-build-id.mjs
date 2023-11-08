import buildInfo from '../build-info.json' assert { type: 'json' };

export default function generateBuildId() {
  const commit = buildInfo.commit;
  const buildId = commit === 'REPLACE_WITH_COMMIT' ? null : commit;
  console.info(
    buildId ? `Generated build id: ${buildId}` : 'Fallback to default build ID',
  );
  return buildId;
}
