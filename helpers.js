import fs from "fs";

const LAST_SUBMIT_DATE_FILENAME = "./last_submit_date.txt";

const getLastSubmitTimestamp = async (props) => {
  const { cache } = props.utils;
  await cache.restore(LAST_SUBMIT_DATE_FILENAME);

  if (!fs.existsSync(LAST_SUBMIT_DATE_FILENAME)) {
    return;
  }

  const date = fs.readFileSync(LAST_SUBMIT_DATE_FILENAME, "utf-8");
  return parseInt(`${date}`, 10);
};

export const setLastSubmitTimestamp = async (props) => {
  const { cache } = props.utils;
  const { ignorePeriod } = props.inputs;

  const date = new Date().getTime();
  const period = parseInt(`${ignorePeriod}`, 10);
  fs.writeFileSync(LAST_SUBMIT_DATE_FILENAME, `${date}`);
  return cache.save(LAST_SUBMIT_DATE_FILENAME, { ttl: period });
};

export const isInIgnorePeriod = async (props) => {
  const lastSubmitDate = await getLastSubmitTimestamp(props);
  if (!lastSubmitDate) return false;

  const { ignorePeriod } = props.inputs;
  const period = parseInt(`${ignorePeriod}`, 10) * 1000;
  const now = new Date().getTime();
  return now < lastSubmitDate + period;
};
