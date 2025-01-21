import { isStr, isArray } from "../shared/utils";
import createFiber from "../reconciler/ReactFiber";

/**
 * 该方法专门用于更新 lastPlacedIndex
 * @param {*} newFiber 下面方法生成的新fiber
 * @param {*} lastPlacedIndex 上一次插入的最远的位置
 * @param {*} newIndex 当前的下标，初始值0
 * @param {*} shouldTrackSideEffect 判断初次returnFiber是初次渲染还是更新
 */
function placeChild(
  newFiber,
  lastPlacedIndex,
  newIndex,
  shouldTrackSideEffect
) {
  // 更新fiber对象上面的index
  // fiber对象上面的index记录当前fiber节点在当前层级下的位置
  newFiber.index = newIndex;
  if (!shouldTrackSideEffect) {
    // 进入到这个if说明是初次渲染
    // 那么我们就没有必要记录节点的位置
    return lastPlacedIndex;
  }
}

/**
 * 这个方法主要是用来协调子节点的，这里面就会有diff算法
 * @param {*} returnFiber 因为处理的是子节点，传入的当前的wip，也就是return（父节点）了
 * @param {*} children 子节点的vnode
 */
export function reconcileChildren(returnFiber, children) {
  if (isStr(children)) return; // 如果是文本节点就不用处理了，updateNode中处理过了

  // 如果只有一个子节点 那么children就是一个vnode对象
  // 如果有多个子节点 那么children就是vnode数组
  // 所以我们就把它们全部处理成数组 newChildren
  const newChildren = isArray(children) ? children : [children];

  // 声明一些变量
  let previousNewFiber = null; //上一个fiber对象
  let oldFiber = returnFiber.alternate?.child; //上衣fiber对象 对应的旧fiber对象
  let i = 0; // 记录children数组的索引
  let lastPlacedIndex = 0; // 上一次DOM节点插入最远的地方
  let shouldTrackSideEffect = !!returnFiber.alternate; // 是否需要追踪副作用  true代表更新 false 代表组件初次渲染

  // 第一遍遍历，尝试复用这些节点
  // 复用节点就得说明你得先有这些节点，才能考虑复用不用的问题
  for (; oldFiber && i < newChildren.length; i++) {
    //TODO:
    // 这里一开始不会进入，因为一开根本就不会进入 初次渲染没有oldFiber
  }

  // 第一遍遍历之后 我们就会发现2个事情
  // 1. oldFiber 根本就没有
  // 2. i === newChildren.length 说明是更新
  if (i === newChildren.length) {
    //TODO
    // 如果还有旧的节点，那么就需要将其删除
  }

  // 初次渲染的情况
  if (!oldFiber) {
    // 初次渲染需要我们将newChildren数组中的每一个元素都要生成一个fiber对象，然后将这些对象串联起来
    for (; i < newChildren.length; i++) {
      // 取出来每一项
      const newChildVnode = newChildren[i];

      // 如果不存在，直接下一个
      if (newChildVnode === null) continue;

      // 创建fiber节点
      const newFiber = createFiber(newChildVnode, returnFiber);

      // 更新lastPlacedIndex
      lastPlacedIndex = placeChild(
        newFiber,
        lastPlacedIndex,
        i,
        shouldTrackSideEffect
      );

      // 将新生成的newFiber添加到fiber链中
      if (previousNewFiber === null) {
        // 说明你是第一个子节点
        returnFiber.child = newFiber;
      } else {
        // 进入此分支，说明当前生成的 fiber 节点并非父 fiber 的第一个节点
        previousNewFiber.sibling = newFiber;
      }

      // 把previousNewFiber更新为 newFiber
      // 从而把当前fiber更新为上一个fiber
      /**
       * 尝试理解为什么这样就生成了
       * 第一次循环
       * previousNewFiber = null; newFiber1 就是第一个子节点
       * newFiber1 -> previousNewFiber
       * 第二次循环
       * previousNewFiber = newFiber1
       * 那么newFiber1的兄弟节点是不是就是newFiber2
       * 此时父fiber的children里面就有个两个了
       * 以此类推 父fiber的children里面就全是新的了
       */
      previousNewFiber = newFiber;
    }
  }
}
