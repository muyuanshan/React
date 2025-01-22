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

/**
 * 判断参数 arr 是否为数组
 * @param {*} arr
 * @returns
 */
export function isArray(arr) {
  return Array.isArray(arr);
}

/**
 * 该方法主要更新真实dom上的节点属性
 * @param {*} node 真实的dom节点
 * @param {*} preVal 旧值
 * @param {*} nextVal 新值
 */
export function updateNode(node, preVal, nextVal) {
  // 主要做两件事
  // 1. 对旧值处理
  // 2. 对新值处理

  // 对旧值的处理
  Object.keys(preVal).forEach((k) => {
    // k 值的不同情况处理
    // k 中有children
    if (k === "children") {
      // 判断children是不是字符串，如果是字符串，说明的是文本节点，置为空
      if (isStr(preVal[k])) {
        node.textContent = "";
      }
    } else if (k.startsWith("on")) {
      // k 值是事件的，需要将旧值移除掉
      // 获取event的名字
      let eventName = k.slice(2).toLowerCase();

      // 如果eventName是change的话 需要进行特殊处理
      if (eventName === "change") {
        eventName = "input";
      }
      // 移除事件
      node.removeEventListener(eventName, preVal[k]);
    } else {
      // 进入到这里的说明的是普通属性,例如id， name之类的
      // 这里不能无脑去除，看一下是不是在新的值中间还有使用
      if (!(k in nextVal)) {
        node[k] = "";
      }
    }
  });

  // 对新的值处理，流程基本和上面一样，不过上面清空这里是添加，反着操作
  Object.keys(nextVal).forEach((k) => {
    if (k === "children") {
      if (isStr(nextVal[k])) {
        node.textContent = nextVal[k];
      }
    } else if (k.startsWith("on")) {
      let eventName = k.slice(2).toLowerCase();

      if (eventName === "change") {
        eventName = "input";
      }

      node.addEventListener(eventName, nextVal[k]);
    } else {
      node[k] = nextVal[k];
    }
  });
}

/**
 *
 * @returns 返回当前时间
 * 关于 performance API 的说明，可以参阅：https://developer.mozilla.org/zh-CN/docs/Web/API/Performance/now
 */
export function getCurrentTime() {
  return performance.now();
}

/**
 * 比较两个依赖项数组的每一项是否相同
 * 如果都相同，返回 true，否则返回 false
 * @param {*} nextDeps 新的依赖项数组
 * @param {*} prevDeps 旧的依赖项数组
 */
export function areHookInputEqual(nextDeps, prevDeps) {
  if (prevDeps === null) return false;
  for (let i = 0; i < prevDeps.length && i < nextDeps.length; i++) {
    // Object.is 是一个静态方法，用来严格比较两个值是否相同
    if (Object.is(nextDeps[i], prevDeps[i])) {
      continue;
    }
    // 只要有一项不相等，就返回 false
    return false;
  }
  // 上面的整个循环都跑完了都没有返回 false，说明两个依赖项数组是相等的
  return true;
}
