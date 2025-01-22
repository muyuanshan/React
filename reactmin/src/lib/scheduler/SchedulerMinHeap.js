/**
 * 该文件为最小堆的实现
 * 首先需要你对最小堆有一定的了解
 *
 * 最小堆必须是完全二叉树，即除最后一层外，所有层都被完全填满，
 * 且最后一层的节点从左到右排列。
 *
 * 每个节点的值必须小于或等于其子节点的值。
 */

/**
 * 返回任务队列的第一个任务
 * @param {*} heap 任务队列
 */
export function peek(heap) {
  return heap.length === 0 ? null : heap[0];
}

/**
 * 向任务队列中添加一个任务
 * @param {*} heap 任务队列
 * @param {*} task 任务
 */
export function MinHeapPush(heap, task) {
  const index = heap.length;// 获取任务队列的长度

  heap.push(task);// 将当前任务直接推入到任务队列的末尾，目前不一定在合适的位置

  shiftUp(heap, task, index) // 将当前任务进行上浮操作，使其在合适的位置
}

/**
 * 负责从任务队列里面删除堆顶的任务
 * @param {*} heap 任务队列
 */

export function MinHeapPop(heap) {
  if(heap.length === 0)  return null;

  const first = heap[0];

  const last = heap.pop();

  if (first !== last) {
    heap[0] = last;
    shiftDown(heap, last, 0);
  }

  return first;
}

/**
 * 上浮操作
 * @param {*} heap 任务队列
 * @param {*} node 当前任务
 * @param {*} i 任务队列的长度
 */
function shiftUp(heap, node, i) {
  let index = i; // index 保存也就是任务队列的长度
  while (index > 0) {
    // 这里涉及到了二进制里面的移位操作的知识，每右移一位，相当于除以 2，每左移一位，相当于乘以 2
    // 这里之所以要除以 2，是因为我们要获取到父节点的索引，要找上一层的节点
    const parentIndex = (index - 1) >> 1; // 获取父节点的索引 至于为啥要除 2 公式推到，推到过程自己了解
    const parent = heap[parentIndex]; // 获取父节点的数据

    if (compare(parent, node) > 0) {
      /**
       * 如果父节点的过期时间＞子节点的过期时间，说明子节点的过期时间小
       * 子节点的过期时间更紧急，那么就需要将子节点上浮
       * 那么就需要交换父节点和子节点的位置
       */
      heap[parentIndex] = node;
      heap[index] = parent;
      index = parentIndex;
    } else {
      return;
    }
  }
}

/**
 * 下沉操作
 * @param {*} heap 任务队列
 * @param {*} node 之前的最后一个任务，但是现在已经被放置到堆顶了
 * @param {*} i 该任务的下标 初始0
 */
function shiftDown(heap, node, i) {
  let index = i; // 记录当前任务的下标
  let len = heap.length; // 记录当前任务队列的长度
  const halfLen = len >> 1; // 位运算，相当于 len/2 取一半 并向下取整

  // 使用数组数组来进行二叉树的实现，数组不能越界
  // 因为是二叉树，我们要么比较左树，要么比较右树
  while (index < halfLen) {
    /**
     * 公式
     * 父节点索引为i
     * 左子节点的索引为2i+1
     * 右子节点的索引为2i+2
     */
    const leftIndex = index * 2 + 1; // 左边节点对应的索引
    const rightIndex = index * 2 + 2; // 右边节点对应的索引

    const left = heap[leftIndex]; // 获取左节点任务
    const right = heap[rightIndex]; // 获取右节点任务

    if (compare(left, node) < 0) {
      // 如果进入此分支，说明左节点的过期时间更紧急
      // 接下来还要进行左右节点的比较，谁小谁才能上去
      // 为什么要做right < len 的判断呢？
      // 因为右边的节点可能存在缺失的情况，所以需要判断一下索引值是否超出了数组的长度，防止数组越界
      if (rightIndex < len && compare(right, left) < 0) {
        // 如果进入此分支，说明右边节点的过期时间更紧急
        heap[index] = right;
        heap[rightIndex] = node;
        index = rightIndex;
      } else {
        // 如果进入此分支，说明左边节点的过期时间更紧急
        heap[index] = left;
        heap[leftIndex] = node;
        index = leftIndex;
      }
    } else if (compare(right, node) < 0 && rightIndex < len) {
      // 如果进入此分支。说明右节点的过期时间更紧急
      // 这里需要判断一下，右节点的索引不能越界

      heap[index] = right;
      heap[rightIndex] = node;
      index = rightIndex;
    } else {
      // 当前就是最小的
      return;
    }
  }
}

/**
 * 比较函数。接受两个任务
 * @param {*} a
 * @param {*} b
 */
function compare(a, b) {
  // 没有任务都有一个 sortIndex属性，表示该任务的过期时间
  // 假设父节点的过期时间为 10，子节点的过期时间为1
  const diff = a.sortIndex - b.sortIndex;
  // sortIndex 比较不出来先后，就用id比较
  return diff !== 0 ? diff : a.id - b.id;
}

