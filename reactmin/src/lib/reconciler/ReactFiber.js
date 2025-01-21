// 本文件主要是fiber对象，并针对不同的类型，打上不同的tag
import { Placement, isStr, isFn, isUndefined } from "../shared/utils";
import {
  FunctionComponent,
  ClassComponent,
  HostComponent,
  HostText,
  Fragment,
} from "./ReactWorkTag";

/**
 *
 * @param {*} vnode 当前的vnode节点
 * @param {*} returnFiber 父Fiber节点
 */
function createFiber(vnode, returnFiber) {
  const fiber = {
    type: vnode.type, // fiber类型
    key: vnode.key,
    props: vnode.props,
    stateNode: null, // 存储当前的fiber对象所对应的DOM节点
    child: null, // 子fiber
    sibling: null, // 兄弟fiber
    return: returnFiber, // 父fiber
    flags: Placement, // 该fiber对象需要做的具体操作
    index: null, // 记录当前节点在当前层级的位置
    alternate: null, // 存储就的fiber节点
  };

  // 实际上fiber上面还有一个tag值
  // 这个tag值是什么取决于type是什么类型
  // 不同的vnode类型，type是不一样的
  const type = vnode.type;

  if (isStr(type)) {
    // 判断是不是原生标签
    fiber.tag = HostComponent;
  } else if (isFn(type)) {
    // 注意：这里的函数组件和类组件的type都是function
    // 函数组件的type值为f xxx()
    // 类组件 class xxx, 背后仍是一个函数  构造函数
    // 所以我们要用isReactComponent 来判断是不是类组件

    if (type.prototype.isReactComponent) {
      fiber.tag = ClassComponent;
    } else {
      fiber.tag = FunctionComponent;
    }
  } else if (isUndefined(type)) {
    // 这里是一个文本节点
    // 文本节点没有props属性，我们手动给一个

    fiber.tag = HostText;
    fiber.props = {
      children: vnode,
    };
  } else {
    fiber.tag = Fragment;
  }

  return fiber;
}

export default createFiber;
