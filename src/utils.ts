export function createProxy<T extends object>(value: T): T {
  const proxy: T = Object.create(null)
  for (let k of Object.keys(value) as Array<keyof T>) {
    const x = value[k]!
    // @ts-expect-error
    proxy[k] = (...args: Array<{}>) => x.apply(value, args)
  }
  return proxy
}
