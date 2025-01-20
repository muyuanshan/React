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