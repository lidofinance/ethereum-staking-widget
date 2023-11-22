const urlRegex =
  // TODO: http and another protocols
  // eslint-disable-next-line no-useless-escape
  /^https?:\/\/[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;

export const isUrl = (value: string) => urlRegex.test(value);
