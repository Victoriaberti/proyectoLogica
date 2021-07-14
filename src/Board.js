import React from 'react';
import Square from './Square';
import Pista from './Pista';

class Board extends React.Component {
    render() {
        const { estadoDelJuego, listaFilas, listaColumnas } = this.props;
        const grillaVisible = (estadoDelJuego !== 'Juego en pausa') ? this.props.grid : this.props.grillaResuelta;
        const pistasDeFilas = this.props.pistasEnFilas;
        const pistasDeColumnas = this.props.pistasEnColumnas;
        const isDisabled = estadoDelJuego !== "Juego en curso";
        return (
            <div className = "divisionExterna">
                <div className = "pistasColumnas">
                    { 
                        pistasDeColumnas.map((elemento, i) => 
                        <Pista elem = {elemento} key = {i} value = {this.props.pistasEnColumnas[i]} completa={listaColumnas[i]} isVertical/> )
                    }
                </div>
                <div className="contenidoHorizontal" >
                    <div>
                        <div className = "pistasFilas">
                            { 
                                pistasDeFilas.map((elemento, i) => 
                                <Pista elem = {elemento} key = {i} value = {this.props.pistasEnFilas[i]} completa={listaFilas[i]} />)
                            }
                        </div>   
                    </div>
                    <div className = "board" 
                        style={{
                            gridTemplateRows: 'repeat(' + this.props.grid.length + ', 30px)',
                            gridTemplateColumns: 'repeat(' + this.props.grid[0].length + ', 30px)'
                        }}>
                        {grillaVisible.map((row, i) =>
                            row.map((cell, j) =>
                                <Square value={cell} onClickSquare={() => this.props.onClickBoard(i, j)} key={i + j} isDisabled={isDisabled}/>
                            )
                        )}
                    </div>
                </div>
            </div>
        );
    }
}

export default Board;