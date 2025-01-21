import { updateNode } from "../shared/utils";
import { reconcileChildren } from "./ReactChildFiber.js";

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
