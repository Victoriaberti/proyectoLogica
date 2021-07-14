import React from 'react';

class Square extends React.Component {
    render() {
        const { isDisabled } = this.props;
        const square = this.props.value === '#' ? "square fill" : "square";
        return (
            <button className = {square} disabled = {isDisabled} onClick = {() => this.props.onClickSquare()}>
                {this.props.value === "X" && !isDisabled ? "X" : null}
            </button>
        );
    }
}
export default Square;