// 该文件负责整个 React 的一个执行流程
import beginWork from "./ReactFiberBeginWork";
import completeWork from "./ReactFiberCompleteWork";
import commitWorker from "./ReactFiberCommitWork";
import scheduleCallback from "../scheduler/Scheduler";

// wip 的英语全称为 work in progress，表示正在进行的工作
// 我们使用这个变量来保存当前正在进行的工作 fiber 对象

let wip = null;

// 从名字上也可以看出，这是保存当前根节点的 fiber 对象
let wipRoot = null;

/**
 *
 * @param {*} fiber 需要更新的节点
 */
function scheduleUpdateOnFiber(fiber) {
  wip = fiber;
  wipRoot = fiber;

  // 目前我们先使用 requestIdleCallback 来进行调用
  // 后期使用 scheduler 包来进行调用
  // 当浏览器的每一帧有空闲时间的时候，就会执行 workloop 函数
  // 浏览器api requestIdleCallback
  // requestIdleCallback(workloop);
  scheduleCallback(workloop);
}

/**
 * 在根据每一帧还有剩余的时间的执行
 * @param {*} deadline 每一帧有剩余的时间
 */
// function workloop(deadline) {
//   while (wip && deadline.timeRemaining() > 0) {
//     // 进入到这个循环里面说明现在有需要处理的节点 && 还有时间处理

//     perfromUintOfWork(); // 负责处理一个fiber
//   }
//   // 代码来到这里说明 要么是这个fiber不用管，要么是循环完成了
//   if (!wip) {
//     // 我们需要将wip给提交过程, 整个fiber树都处理完了
//     commitRoot();
//   }
// }

/**
 * 该函数会在每一帧有剩余时间的时候执行
 * @param {*} time 接收一个时间参数，如果超过了该时间，那么就不再处理下一个 fiber
 */
function workloop(time) {
  while (wip) {
    if (time < 0) return false;
    performUnitOfWork(); // 该方法负责处理一个 fiber 节点
  }
  if (!wip && wipRoot) {
    commitRoot();
  }
}


/**
 *
 * 负责处理一个fiber，主要做4件事
 * 1. 处理当前的fiber对象
 * 2. 通过深度优先遍历子节点，生成子节点的fiber对象，然后继续处理
 * 3. 提交副作用
 * 4. 进行渲染
 */
function performUnitOfWork() {
  beginWork(wip); // 处理当前对象

  // 如果说有子节点，改变wip 指向子节点
  if (wip.child) {
    wip = wip.child;
    return;
  }

  completeWork(wip);

  let next = wip;

  // 找兄弟节点
  while (next) {
    if (next.sibling) {
      wip = next.sibling;
      return;
    }

    next = next.return;

    // 在找父辈的之前先执行一下这个
    completeWork(next);
  }

  // 如果执行到这里，说明整个 fiber 树都处理完了
  // 没有节点需要处理了
  wip = null;
}

function commitRoot() {
  commitWorker(wipRoot);
  // 渲染完成后将 wipRoot 置为 null
  wipRoot = null;
}

export default scheduleUpdateOnFiber;
