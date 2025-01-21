import createFiber from '../reconciler/ReactFiber';
import scheduleUpdateOnFiber from '../reconciler/ReactFiberWorkLoop';

/**
 * 更新容器
 * @param {*} element 要挂载的vnode
 * @param {*} container  容器的DOM节点
 */
function updateContainer(element, container) {
    const fiber = createFiber(element, {
        // 这个对象就是父fiber对象, 里面放一些核心属性
        type: container.nodeName.toLowerCase(),
        stateNode: container,
    })
    scheduleUpdateOnFiber(fiber);
}

// ReactDOMRoot 类
class ReactDOMRoot {
    constructor(container) {
        // 将拿到的根节点 保存一份
        this._internalRoot = container;
    }

    /**
     * 
     * @param {*} children 要挂载到根节点的 vnode
     * 规定
     * 1. 以前的vnode => vnode
     * 2. 更新后vnode => fiber
     */
    render(children) {
        updateContainer(children, this._internalRoot)
    }
}

const ReactDOM = {

    /**
     * 
     * @param {*} container 要挂载的根 DOM 节点
     * @returns 返回值是一个对象，这个对象有一个render方法
     */
    createRoot(container) {
        return new ReactDOMRoot(container)
    }
}

export default ReactDOM;