import { IRawJob } from './interface';

export const getNextId = (items: IRawJob[]) => {
  const highestId = items.reduce((max: number, item: IRawJob) => {
    if (item.id > max) {
      max = item.id;
    }
    return max;
  }, 0);
  return highestId + 1;
};
