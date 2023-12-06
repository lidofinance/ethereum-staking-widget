export const formatTimestamp = (timestamp: string, short = false): string => {
  const diff = new Date(timestamp).getTime() - Date.now();
  const hours = Math.ceil(diff / (1000 * 60 * 60));
  const hour = short ? 'h' : 'hour';

  if (hours < 24) {
    const plural = hours === 1 || short ? '' : 's';
    return `~${hours} ${hour}${plural}`;
  }

  const days = Math.ceil(hours / 24);
  const day = short ? 'd' : 'day';
  const plural = days === 1 || short ? '' : 's';
  return `~${days} ${day}${plural}`;
};
