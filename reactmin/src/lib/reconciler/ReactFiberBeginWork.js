// 在beginWork中，主要就是根据fiber的不同tag值，调用不同的方法来处理各自fiber
import {
  FunctionComponent,
  ClassComponent,
  HostText,
  HostComponent,
  Fragment,
} from "./ReactWorkTag";
import {
  updateHostComponent,
  updateHostTextComponent,
  updateClassComponent,
  updateFunctionComponent,
} from "./ReactFiberReconciler";

/**
 * 根据不同的tag，调用不同的方法
 * @param {*} wip 需要处理的fiber节点
 */
function beginWork(wip) {
  const tag = wip.tag;

  switch (tag) {
    case HostComponent: {
      updateHostComponent(wip);
      break;
    }

    case FunctionComponent: {
      updateFunctionComponent(wip);
      break;
    }

    case ClassComponent: {
      updateClassComponent(wip);
      break;
    }

    case HostText: {
      updateHostTextComponent(wip);
      break;
    }

    case Fragment: {
      break;
    }
  }
}

export default beginWork;
