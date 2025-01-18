import React from 'react';

function Alert(props) {
    return (
        // <div className="alert alert-warning alert-dismissible" role="alert">
        <div className={["alert","alert-dismissible","alert-" + props.type].join(" ")} role="alert">
            <button type="button" className="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>
            <strong>提示!</strong> {props.alert}
        </div>
    );
}

export default Alert;