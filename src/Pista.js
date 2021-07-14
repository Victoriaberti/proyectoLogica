import React from 'react';

class Pista extends React.Component {
    render() {
        const { completa, isVertical} = this.props;
        const pista = completa ? "pista pistaPintada" : "pista";
        const content = isVertical ? (
            this.props.elem.map((num, i) =>
                <div key={i}>
                    {num}
                </div>
            )
        ) : (<div>{this.props.value.join(" ")}</div>);
        return (
            <div className = {pista}>
                {content}
            </div>
        );
    }
}

export default Pista;