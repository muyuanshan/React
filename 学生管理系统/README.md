# 如何启动项目
启动server端服务
进入到server的文件夹 npm run json:server
启动client 服务 yarn start




# 组件
- BrowserRouter：整个前端路由以 history 模式开始，包裹根组件
- HashRouter：整个前端路由以 hash 模式开始，包裹根组件
- Routes：类似于 v5 版本的 Switch，主要是提供一个上下文环境
- Route：在 Route 组件中书写你对应的路由，以及路由所对应的组件
- path：匹配的路由
- element：匹配上该路由时，要渲染的组件
- Navigate：导航组件，类似于 useNavigate 的返回值函数，只不过这是一个组件
- NavLink：类似于 Link，最终和 Link 一样，会被渲染为 a 标签，注意它和 Link 的区别，实际上就是当前链接，会有一个名为 active 的激活样式，所以一般用于做顶部或者左侧导航栏的跳转
# Hooks
- useLocation：获取到 location 对象，获取到 location 对象后，我们可以获取 state 属性，这往往是其他路由跳转过来的时候，会在 state 里面传递额外的数据
- useNavigate：调用之后会返回一个函数，通过该函数可以做跳转。
useParams：获取动态参数


# useRoutes
```
function Router(props) {
    return useRoutes([
        {
            path: "/home",
            element: <Home />,
        },
        {
            path: "/about",
            element: <About />,
        },
        {
            path: "/add",
            element: <AddOrEdit />,
        },
        {
            path: "/detail/:id",
            element: <Detail />,
        },
        {
            path: "/edit/:id",
            element: <AddOrEdit />,
        },
        {
            path: "/",
            element: <Navigate replace to="/home" />
        }
    ]);
}

export default Router;
```

# 嵌套路由
直接在 useRoutes 进行 chilren 属性的配置即可，类似于 vue-router，children 对应的是一个数组，数组里面是一个一个路由对象
```
 {
   path: "/about",
     element: <About />,
     children : [
         {
           path : "email",
           element : <Email/>
         },
         {
           path : "tel",
           element : <Tel/>
         },
         {
           path : "",
           element: <Navigate replace to="email" />
         }
       ]
 },
 ```


