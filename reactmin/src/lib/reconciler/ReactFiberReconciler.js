import { updateNode } from "../shared/utils";
import { reconcileChildren } from "./ReactChildFiber.js";
import { renderWithHooks } from "../react/ReactHooks.js";
/**
 *
 * @param {*} wip 需要处理的fiber节点
 * 这个fiber确定是一个hostComponet
 */
export function updateHostComponent(wip) {
  // 创建真实的节点
  if (!wip.stateNode) {
    wip.stateNode = document.createElement(wip.type);
    updateNode(wip.stateNode, {}, wip.props);
    // 到目前为止，说明当前的 fiber 节点所对应的 stateNode 已经有值了，也就是说有对应的 DOM 了
    
// 因此接下来的下一步，我们就应该处理子节点了
    reconcileChildren(wip, wip.props.children);

  }
}

/**
 *负责更新文本节点
 * @param {*} wip  需要处理的fiber节点
 */
export function updateHostTextComponent(wip) {
  wip.stateNode = document.createTextNode(wip.props.children);
}

/**
 * 更新函数组件
 * @param {*} wip 需要处理的 fiber 对象节点
 */
export function updateFunctionComponent(wip) {
    // 进入到这里，也就是说，我确定你是一个函数组件
  // 那么在处理 fiber 树之前，我们先处理 hooks
  renderWithHooks(wip);
  const { type, props } = wip;
  // 这里从当前wip中获取到的type是一个函数
  // 执行这个type获取他的返回值
  const children = type(props);

  // 有了他的vnode节点之后，调用reconcileChildren方法，处理子节点
  reconcileChildren(wip, children)
}

/**
 * 更新类组件
 * @param {*} wip 需要处理的 fiber 对象节点
 */
export function updateClassComponent(wip) {
  const { type, props } = wip;
  // 这里的type是一个类，把这个类实例化
  const instance = new type(props);
  // 调用render获取他的返回值
  const children = instance.render();

  reconcileChildren(wip, children);
}