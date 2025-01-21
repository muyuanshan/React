function getParentDOM(wip) {
    let temp = wip;
    while(temp) {
        if (temp.stateNode) return temp.stateNode;
        /**
         * 如果没有进入上面的if语句，说明当前的fiber没有对应的DOM对象，需要向上找
         * 为啥会存在fiber上没有DOM对象呢？
         * 因为该fiber节点上可能是一个类组件或者函数组件或者是一个Fragment
         */
        temp = temp.return;
    }
}

function commitNode(wip) {
    // 获取该fiber对应的所有的父级节点的DOM对象,所以要传wip.return
    const parentNodeDOM = getParentDOM(wip.return);
    // 执行一个DOM操作，这里的判断是指的是，该操作的fiber有没有DOM
    if(wip.stateNode) {
        parentNodeDOM.appendChild(wip.stateNode)
    }
}

/**
 * 
 * @param {*} wip 当前的fiber节点
 * 提交的过程执行3个操作
 * 1. 提交自己
 * 2. 提交自己的子节点
 * 3. 提交自己的兄弟节点
 */
function commitWorker(wip) {
    if(!wip) return;

    commitNode(wip);
    commitWorker(wip.child);
    commitWorker(wip.sibling);
}

export default commitWorker;