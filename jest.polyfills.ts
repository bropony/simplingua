import { TextEncoder, TextDecoder } from "util";

if (typeof (global as any).TextEncoder === "undefined") {
  (global as any).TextEncoder = TextEncoder;
}
if (typeof (global as any).TextDecoder === "undefined") {
  (global as any).TextDecoder = TextDecoder;
}
if (typeof (global as any).structuredClone === "undefined") {
  (global as any).structuredClone = (val: unknown) => JSON.parse(JSON.stringify(val));
}
