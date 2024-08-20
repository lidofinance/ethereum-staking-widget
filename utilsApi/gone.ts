import { API } from 'types/api.js';

export const gone: API = async (_, res) => {
  res.status(410);
  res.end();
};
