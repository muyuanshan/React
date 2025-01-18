import { useState, useEffect } from "react";
import { getStuListApi } from "../api/stuApi";
import Alert from "./Alert";
import { useLocation, NavLink } from "react-router-dom";

function Home(props) {
  const [stuList, setStuList] = useState([]); // 存储所有的数据
  const [searchItem, setSearchItem] = useState(""); // 存储用户输入的搜索信息
  const [alert, setAlert] = useState(null);
  const [searchList, setSearchList] = useState([]); // 存储搜索后的数据

  const location = useLocation();

  const getData = async () => {
    const stuData = await getStuListApi();
    setStuList(stuData.data);
  }

  useEffect(() => {
    getData();
  }, []);

  useEffect(() => {
    if (location.state) {
      setAlert(location.state);
    }
  }, [location]);

  const showAlert = alert ? <Alert {...alert} /> : null;

  const changeHandle = (value) => {
    setSearchItem(value);
    const arr = stuList.filter((item)=>{
        return item.name.match(value);
    });
    setSearchList(arr);
  };

  const list = searchItem ? searchList : stuList;

  const trs = list.length && list.map((item, index) => {
    return (
      <tr key={index}>
        <td>{item.name}</td>
        <td>{item.age}</td>
        <td>{item.phone}</td>
        <td>
          <NavLink to={`/detail/${item.id}`}>详情</NavLink>
        </td>
      </tr>
    );
  });

  return (
    <div>
      {showAlert}
      <input
        type="text"
        placeholder="搜索"
        className="form-control"
        value={searchItem}
        onChange={(e) => changeHandle(e.target.value)}
      ></input>
      <table className="table table-striped table-bordered">
        <thead>
          <tr>
            <th>姓名</th>
            <th>年龄</th>
            <th>联系方式</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>{trs}</tbody>
      </table>
    </div>
  );
}

export default Home;
