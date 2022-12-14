export default function(str: string, padChar: string, totalLength: number) {
  str = str.toString();
  const neededPadding = totalLength - str.length;
  for (let i = 0; i < neededPadding; i++) {
    str = padChar + str;
  }
  return str;
};