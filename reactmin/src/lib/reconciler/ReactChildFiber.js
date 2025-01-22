import { isStr, isArray, Update } from "../shared/utils";
import createFiber from "../reconciler/ReactFiber";
import {
  sameNode,
  placeChild,
  deleteRemainingChildren,
  mapRemainingChildren,
  deleteChild,
} from "./ReactChildFiberAssistant";

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
  let shouldTrackSideEffects = !!returnFiber.alternate; // 是否需要追踪副作用  true代表更新 false 代表组件初次渲染

  let nextOldFiber = null;

  /**
   * diff 核心的算法思想
   * 整体来讲分为5大步骤
   * 1. 第一轮遍历，从左往右遍历新节点（vnode），遍历的同时比较新旧节点（旧节点是fiber对象）
   * 如果节点可以复用就复用，循环继续往右走
   * 如果节点不能复用，跳出循环结束第一轮遍历
   * 2. 检查newChildren是否完成了遍历，因为从上面第一步出来有两种情况
   * 要么跳出来了
   * 要么遍历完成跳出来了，如果完成整个循环，旧节点（fiber对象）还存在，就把这些全都删除
   * 3.初次渲染
   * 还有一种情况也属于初次渲染：旧节点遍历完成了，新节点还剩，这些新节点也属于初次渲染
   * 4. 处理新旧节点都还剩余的情况
   * （1）将剩下的旧节点放入到一个map结构中，方便之后使用
   * （2）遍历剩余的新节点，通过新节点的key去map里面进行查找，看看有没有能用的旧节点
   * 5. 整个节点遍历完成后，如果map中还有剩余的旧节点，这些旧节点也就没有用了全删除
   *
   */

  // 1. 第一轮遍历，从左往右遍历新节点（vnode），在遍历的同时比较新旧节点（旧节点是 fiber 对象）
  // 第一轮遍历，会尝试复用节点
  // 复用节点意味着你首先得有这些节点，才能说能不能复用的问题
  for (; oldFiber && i < newChildren.length; i++) {
    // 这里一开始不会进入，因为一开根本就不会进入 初次渲染没有oldFiber

    // 首先我们拿到当前的 vnode
    const newChild = newChildren[i];
    if (newChild === null) continue;

    // 在判断是否能够复用之前，我们先给 nextOldFiber 赋值
    // 这里有一种情况
    // old 一开始是1 2 3 4 5，进行了一些修改后就剩 5 和 4
    // old >> 5(4) 4(3)
    // new >> 4(3) 1 2 3 5(4)
    // 此时旧的节点的 index 是大于 i，因此我们需要将 nextOldFiber 暂存为 oldFiber

    /**
     * 详细分析上面的例子
     * 旧节点 old：[5(index4),4(index 3)]
     * 新节点 new: [4(index3), 1, 2, 3,5(index4)]
     * 开始比较
     * 新节点4与旧节点5比较，发现5.index(4) > i (3), 旧节点5暂时无法复用，就保存当前这个5节点（nextOldFiber），把旧节点置为null
     * 继续比较4.index（3）== i (3), 发现旧节点可能能用
     */
    if (oldFiber.index > i) {
      // 确保当旧节点的顺序与新节点不匹配（oldFiber.index > i）时，能够暂存当前旧节点，用于后续可能的匹配。
      // 当顺序匹配（oldFiber.index <= i）时，继续尝试复用旧节点。
      // 通过保存 nextOldFiber，维持对未匹配旧节点的引用，以便在整个 Diff 过程中灵活处理

      nextOldFiber = oldFiber;
      oldFiber = null;
    } else {
      nextOldFiber = oldFiber.sibling;
    }

    const same = sameNode(newChild, oldFiber);

    if (!same) {
      // 在退出第一轮遍历之前，我们会做一些额外的工作
      if (oldFiber === null) {
        // 我们需要将 oldFiber 原本的值还原，方便后面使用
        oldFiber = nextOldFiber;
      }
      // 如果不能复用，那么就跳出循环，第一轮遍历就结束了
      break;
    }
    // 如果没有进入到上面的 if，那么代码走到这里，就说明可以复用
    const newFiber = createFiber(newChild, returnFiber);
    // 复用旧 fiber 上面的部分信息，特别是 DOM 节点
    Object.assign(newFiber, {
      stateNode: oldFiber.stateNode,
      alternate: oldFiber,
      flags: Update,
    });

    // 更新 lastPlacedIndex 的值
    lastPlacedIndex = placeChild(
      newFiber,
      lastPlacedIndex,
      i,
      shouldTrackSideEffects
    );

    // 最后，我们需要将 newFiber 加入到 fiber 链表中去
    if (previousNewFiber === null) {
      // 说明你是第一个子节点
      returnFiber.child = newFiber;
    } else {
      // 进入此分支，说明当前生成的 fiber 节点并非父 fiber 的第一个节点
      previousNewFiber.sibling = newFiber;
    }

    // 将 previousNewFiber 设置为 newFiber
    previousNewFiber = newFiber;
    // oldFiber 存储下一个旧节点信息
    oldFiber = nextOldFiber;
  }
  // 2. 检查 newChildren 是否完成了遍历
  // 第一遍遍历之后 我们就会发现2个事情
  // 2-1. oldFiber 根本就没有
  // 2-2. i === newChildren.length 说明是更新
  if (i === newChildren.length) {
    // 如果还有旧的节点，那么就需要将其删除
    // 如果还剩余有旧的 fiber 节点，那么就需要将其删除掉
    deleteRemainingChildren(returnFiber, oldFiber);
    return;
  }

  // 3. 接下来就是我们初次渲染的情况
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
        shouldTrackSideEffects
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

  // 4. 处理新旧节点都还有剩余的情况
  // 首先我们需要创建一个map结构，用于储存剩余的旧节点
  const existingChildren = mapRemainingChildren(oldFiber);
  // 去遍历剩余的新节点
  for (; i < newChildren.length; i++) {
    // 先拿到当前的vnode
    const newChild = newChildren[i];

    if (newChild === null) continue;

    // 根据新节点的 vnode 去生成新的 fiber
    const newFiber = createFiber(newChild, returnFiber);

    // 接下来就需要去哈希表里面寻找是否有可以复用的节点
    const matchedFiber = existingChildren.get(newFiber.key || newFiber.index);
    // 这里就有两种情况：
    // 有可能从哈希表里面找到了，也有可能没有找到

    if (matchedFiber) {
      // 找到了就复用
      Object.assign(newFiber, {
        stateNode: matchedFiber.stateNode,
        alternate: matchedFiber,
        flags: Update,
      });
      // 删除哈希表中的旧 fiber
      existingChildren.delete(newFiber.key || newFiber.index);
    }
    // 更新 lastPlacedIndex 的值
    lastPlacedIndex = placeChild(
      newFiber,
      lastPlacedIndex,
      i,
      shouldTrackSideEffects
    );

    // 形成链表
    if (previousNewFiber === null) {
      // 说明你是第一个子节点
      returnFiber.child = newFiber;
    } else {
      // 进入此分支，说明当前生成的 fiber 节点并非父 fiber 的第一个节点
      previousNewFiber.sibling = newFiber;
    }
    // 不要忘了更新 previousNewFiber
    previousNewFiber = newFiber;

    // 5. 整个新节点遍历完成后，如果 map 中还有剩余的旧节点，这些旧节点也就没有用了，直接删除即可
    if (shouldTrackSideEffects) {
      existingChildren.forEach((child) => {
        deleteChild(returnFiber, child);
      });
    }
  }
}
