本README主要的作用是引导如何读react-min这个项目，并非具体解释react-min具体流程
# creteFiber 流程
1. 在main.js中我们引入了自己的`ReactDOM` 并执行了`createRoot`方法，根据传入的参数 确认了根`root`为容器。
   调用`render`方法我们传入需要渲染的`vnode`
2. 进入的`render`方法里面，可以看到`render` 是`createRoot`返回的一个对象`ReactDOMRoot`里面的方法，`render`方法执行
   调用的是`updateContainer`方法，这个方法调用`createFiber`，创建一个虚拟节点
3. 在`reconciler/ReactFiber`文件中可以看到如何具体创建的一个`vnode`, 这里简要说一下就是创建了一个对象`fiber`, 在这个对象上
   挂在一些属性，因为`type`的不同，所以给不同的`type`打`tag`，然后输出fiber这个节点。
到此我们就完成一个fiber的创建

# work loop流程
这里主要是说一下`scheduleUpdateOnFiber`方法是最终抛出来的，在`react-dom/ReactDom`中的`updateContainer`方法中执行，具体逻辑在
`reconciler/ReactFiberWorkLoop`中

# beginWork
在这一部分创建了两个文件`ReactReconciler.js`和`ReactFiberBeginWork.js`两个文件，在这个文件中主要是处理根据不同的tag 处理不同的wip，`ReactReconciler.js`文件主要就是储存这些不同的方法
在`utils`文件中新增了 `updateNode`的方法，这个方法对真实的dom节点进行处理。

# 生成fiber链表
从下面这个图片就可以看到最终的结构，在`ReactChildFiber.js`中的`reconcileChildren`方法中组成了fiber链表，从`div`一直到里面的`li`组成一个链表
![alt text](src/assets/image.png)

从下面的这张图我们能够看出来，div没有兄弟元素sibling为null, 父元素为root，子元素为ui
![alt text](src/assets/image-div.png)

从下面的这张图我们可以看到，ul的子元素是li，父元素是div
![alt text](src/assets/image-ul.png)

从下面的这张图我们可以看到，li的父元素是ul sibling元素是li
![alt text](src/assets/image-li.png)

# 完成标签的初次渲染
这块主要是新增了`ReactFiberCommitWork`文件，主要把生成的fiber转换成DOM节点。效果如下图
![alt text](src/assets/image-原生标签.png)
这个文件包含三个方法`getParentDOM`,`commitNode`, `commitWorker`

## getParentDOM
获取当前的fiber节点的父对象，注意里面有一个判断
为什么要获取？因为我们要在里面插入vnode

## commitNode
执行dom操作

## commitWorker
最终抛出来的方法，在`ReactFiberWorkLoop`文件中的`perfromUintOfWork`方法中执行。
这个方法干三件事
- 提交自己
- 提交自己的子节点
- 提交自己的兄弟节点

# 初始化函数组件和类组件渲染
这一块用的例子是类组件，函数组件的效果自行解开注释进行操作即可
1. 新建了一个`react/React.js`文件，这个文件主要是添加一个属性`isReactComponent`, 为什么要加这个属性，因为`Component`本质上还是一个函数（构造函数），所以我们要在其原型上添加一个标识，来说明他是一个类组件，防止在打tag的时候打成函数组件的tag。
2. `ReactFiberReconciler.js`文件中的新增两个函数`updateFunctionComponent`, `updateClassComponent`, 分别处理函数组件和类组件，调用子协调器，处理各自的子vnode
3. 在`ReactFiberBeginWork.js`文件中，对应的tag去执行`updateFunctionComponent`和`updateClassComponent`方法

![alt text](src/assets/image-class.png)

# 实现任务最小堆
详解见代码`src/lib/scheduler/SchedulerMinHeap.js`

# 实现Scheduler调度器
在上面之前的时候，我们一直用的是`requestIdleCallback`这个浏览器的方法，这一块就是我们具体简单实现一个。主要逻辑在`src/lib/scheduler.js` 文件中，到这里我们就把`ReactFiberWorkLoop.js`文件中的浏览器方法替换了。`utils.js`中新增了一个获取当前时间的方法。

# 实现diff算法的过程
## diff 核心的算法思想
整体来讲分为5大步骤
1. 第一轮遍历，从左往右遍历新节点（vnode），遍历的同时比较新旧节点（旧节点是fiber对象）
如果节点可以复用就复用，循环继续往右走
如果节点不能复用，跳出循环结束第一轮遍历
2. 检查newChildren是否完成了遍历，因为从上面第一步出来有两种情况
要么跳出来了
要么遍历完成跳出来了，如果完成整个循环，旧节点（fiber对象）还存在，就把这些全都删除
3. 初次渲染
还有一种情况也属于初次渲染：旧节点遍历完成了，新节点还剩，这些新节点也属于初次渲染
4. 处理新旧节点都还剩余的情况
（1）将剩下的旧节点放入到一个map结构中，方便之后使用
（2）遍历剩余的新节点，通过新节点的key去map里面进行查找，看看有没有能用的旧节点
5. 整个节点遍历完成后，如果map中还有剩余的旧节点，这些旧节点也就没有用了全删除
