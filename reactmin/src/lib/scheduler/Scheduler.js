/**
 * 该文件就是调度器的具体实现
 */

import { MinHeapPush, MinHeapPop, peek } from "./SchedulerMinHeap";
import { getCurrentTime } from "../shared/utils";

const taskQueue = []; // 任务队列

let taskIdCounter = 1; // 任务id计数器

let hasTimeRemaining = true; // 是否还有剩余时间

// // 通过 MessageChannel 来模拟浏览器的 requestIdleCallback
const { port1, port2 } = new MessageChannel();

export default function scheduleCallback(callback) {
  const currentTime = getCurrentTime(); // 获取当前时间

  // 接下来设置任务过期时间
  // 在 React 源码中，针对不同的任务类型，设定了不同的过期时间
  // 那么我们这里做一个简化，所有任务的优先级都相同
  const timeout = -1;

  const expirationTime = currentTime + timeout;

  // 组装一个新的任务对象
  const newTask = {
    id: taskIdCounter++,
    callback,
    expirationTime,
    sortIndex: expirationTime,
  };

  // 将新的任务推入到任务队列
  MinHeapPush(taskQueue, newTask);

  // 接下来请求调度，这样会产生一个宏任务
  port1.postMessage(null);
}

// 每次 port1.postMessage(null) 的时候，就会触发 port2.onmessage
// 在 port2.onmessage 中，我们会去执行任务队列中的任务
port2.onmessage = function () {
  const currentTime = getCurrentTime();

  let currentTask = peek(taskQueue);

  while (currentTask) {
    // 首先这里需要做一个时间上面的判断
    // 如果任务的过期时间远大于当前时间（说明当前这个任务不着急，可以延期执行）
    // 并且当前帧所剩余的时间也不够了，那么就不执行了
    if (currentTask.expirationTime > currentTime && !hasTimeRemaining) {
      break;
    }

    // 没有进入到上面的 if，说明当前的任务是需要执行的
    const callback = currentTask.callback;
    currentTask.callback = null;
    // 执行对应的任务，传入剩余的时间
    const taskResult = callback(currentTime - currentTask.expirationTime);
    if(taskResult === undefined) {
      // 进入此 if，说明是任务执行完了才退出来的，那么就可以将其从任务队列中删除了
      MinHeapPop(taskQueue);
      currentTask = peek(taskQueue);
    }
  }
};
