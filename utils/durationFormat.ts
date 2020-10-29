const zeroPad = (num: number, places: number) =>
  String(num).padStart(places, "0");

export function msToHhmm(millisec: string) {
  const minutes = Math.floor(parseInt(millisec, 10) / 60000);
  return `${Math.floor(minutes / 60)}:${zeroPad(minutes % 60, 2)}`;
}

export function hhmmToMs(input: string) {
  const [hour, minutes] = input.split(":");
  return `${
    (parseInt(hour, 10) || 0) * 60000 * 60 +
    (parseInt(minutes, 10) || 0) * 60000
  }`;
}
