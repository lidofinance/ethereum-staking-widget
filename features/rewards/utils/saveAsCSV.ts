type SomeObj = {
  [key: string]: unknown;
};

const objToCSV = (objArray: SomeObj[]) => {
  const firstItem = objArray[0];
  const header = Object.keys(firstItem).toString();

  const data = objArray.map((object) => Object.values(object).toString());

  return [header, ...data].join('\n');
};

export const saveAsCSV = (data: SomeObj[], fileName = 'Lido Rewards') => {
  if (data.length === 0) {
    return;
  }

  const csv = objToCSV(data);

  const exportedFilenmae = fileName + '.csv';

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });

  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', exportedFilenmae);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
