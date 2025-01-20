// 存放工具方法的文件

// 做标记用
// 没有任何操作
export const NoFlags = "0b00000000000000000000";
// 节点新增、移动、插入
export const Placement = "0b0000000000000000000010";
// 节点更新
export const Update = "0b0000000000000000000100";
// 节点删除
export const Deletion = "0b0000000000000000001000";

/**
 * 判断参数 s 是否为字符串
 * @param {*} s
 * @returns
 */
export function isStr(s) {
  return typeof s === "string";
}

/**
 * 判断参数 fn 是否为函数
 * @param {*} fn
 * @returns
 */
export function isFn(fn) {
  return typeof fn === "function";
}

/**
 * 判断参数 s 是否为 undefined
 * @param {*} s
 * @returns
 */
export function isUndefined(s) {
  return s === undefined;
}
