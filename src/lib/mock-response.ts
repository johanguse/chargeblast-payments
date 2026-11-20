export const paymentsListDelayMs = 350;

/**
 * Simulates a network response with a delay.
 * @param value The value to return.
 * @param delayMs The delay in milliseconds.
 * @returns A promise that resolves to the value after the delay.
 */
export async function mockResponse<T>(value: T, delayMs: number): Promise<T> {
  await new Promise<void>((resolve) => setTimeout(resolve, delayMs));
  return value;
}
