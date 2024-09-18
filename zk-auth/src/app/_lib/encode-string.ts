export function encodeString(value: string) {
  const encoder = new TextEncoder();

  return encoder.encode(value);
}
