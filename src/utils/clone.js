/**
 * 深拷贝
 * @param {Object} obj 要拷贝的对象
 * @param {HASH} hash
 * @returns Object
 */
export const deepClone = (obj, hash = new WeakMap()) => {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }

  // 如果循环引用,就用 weakMap 来解决
  if (hash.has(obj)) {
    return hash.get(obj)
  }

  // 日期对象直接返回一个新的日期对象
  if (obj instanceof Date) {
    return new Date(obj)
  }

  // 正则对象直接返回一个新的正则对象
  if (obj instanceof RegExp) {
    return new RegExp(obj)
  }

  if (obj instanceof Set) {
    const set = new Set()
    hash.set(obj, set)
    obj.forEach((item) => {
      set.add(deepClone(item))
    })
    return set
  }

  if (obj instanceof Map) {
    const map = new Map()
    hash.set(obj, map)
    obj.forEach((item, key) => {
      map.set(key, deepClone(item))
    })
    return map
  }

  // 如果循环引用,就用 weakMap 来解决
  if (hash.has(obj)) {
    return hash.get(obj)
  }

  const cloneObj = new obj.constructor()
  hash.set(obj, cloneObj)
  for (var key in obj) {
    cloneObj[key] = deepClone(obj[key])
  }
  return cloneObj
}

/**
 * 浅拷贝
 * @param {Object} obj 要拷贝的对象
 * @returns Object
 */
export const shallowClone = (obj) => {
  let cloneObj = Object.create(Object.getPrototypeOf(obj))
  for (let key of Reflect.ownKeys(obj)) {
    cloneObj[key] = obj[key]
  }
  return cloneObj
}
