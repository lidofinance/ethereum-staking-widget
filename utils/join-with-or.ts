export const joinWithOr = (array: unknown[]) => {
  const copy = [...array];
  const last = copy.pop();
  return [copy.join(', '), last].filter((entry) => entry).join(' or ');
};
