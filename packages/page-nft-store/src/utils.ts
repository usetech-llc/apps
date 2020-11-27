export function roundNum(num: number) {
  let roundedNum = '' + Math.round(num * 1000) / 1000;
  const dec = roundedNum.indexOf('.');
  if ((dec >= 0) && (roundedNum.length >= dec+4)) {
    roundedNum = roundedNum.substr(0, dec+4);
  }

  return roundedNum;
}
