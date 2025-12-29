
export default function parseCharacters(input) {
  return input
    .split(",")
    .map(name => name.trim())
    .filter(name => name.length > 0);
}
