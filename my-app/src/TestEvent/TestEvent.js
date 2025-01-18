function Button() {
    let click = () => {
        console.log('你点击了');
    }

    return (
        <button onClick={click}>点击</button>
    )
}

export default Button;