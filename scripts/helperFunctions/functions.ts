export function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}


export function titleCase(str: string) {
  var splitStr = str.toLowerCase().split(" ");
  for (var i = 0; i < splitStr.length; i++) {
    splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
  }
  return splitStr.join(" ");
}


export function msToHMS(ms: number) {
  let seconds = ms / 1000;
  const hours = Math.trunc(seconds / 3600); 
  seconds = seconds % 3600;

  const minutes = Math.trunc(seconds / 60);
  seconds = seconds % 60;
  return hours + ":" + minutes + ":" + seconds;
}
