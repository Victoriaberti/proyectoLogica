import React from 'react';
import PengineClient from './PengineClient';
import Board from './Board';

class Game extends React.Component {

  pengine;

  constructor(props) {
    super(props);
    this.state = {
      grid: null,
      grillaResuelta : null,
      pistasEnFilas: null,
      pistasEnColumnas: null,
      listaFilas: [],
      listaColumnas: [],
      waiting: false,
      estadoDelJuego: 'Juego en curso', // Si el juego se ganó o está en pausa se utiliza para deshabilitar los botones
      seleccion : '#', // si el valor es '#' está pintando, si es 'X' está desmarcando, si es 'S' mostrando solución y si es 'P' mostrará pista
      mostrandoSolucion :  false,
    };
    this.handleClick = this.handleClick.bind(this);
    this.handlePengineCreate = this.handlePengineCreate.bind(this);
    this.pengine = new PengineClient(this.handlePengineCreate);
  }

  handlePengineCreate() {
    const queryS = 'init(PistasFilas, PistasColumnas, Grilla)';
    this.pengine.query(queryS, (success, response) => {
      if (success) {
        this.setState({
          grid: response['Grilla'],
          pistasEnFilas: response['PistasFilas'],
          pistasEnColumnas: response['PistasColumnas'],
          listaFilas: [].constructor(response['PistasFilas'].length),
          listaColumnas: [].constructor(response['PistasColumnas'].length),
        });
        const querySS = 'resolverGrilla('+JSON.stringify(this.state.pistasEnFilas)+','
          +JSON.stringify(this.state.pistasEnColumnas)+','
          +JSON.stringify(this.state.grid).replaceAll('"_"', "_")+','
          +'GrillaResueltaAux,'
          +(this.state.listaFilas.length-1)+','
          +(this.state.listaColumnas.length-1)+')';
        this.pengine.query(querySS, (success, response) => {
        if(success){
          this.setState({
            grillaResuelta: response['GrillaResueltaAux'],
          })
        }
      })
      }
    });
  }

  handleClick(i, j) {
    // No action on click if we are waiting.
    const selActual = this.state.seleccion;
    if (this.state.waiting || selActual === 'S') {
      return;
    }
    if(selActual === 'P' && this.state.grid[i][j] !== "_") {
      return;
    }
    let marca = selActual === "P" ? '"'+this.state.grillaResuelta[i][j]+'"' : '"'+selActual+'"';
    // Build Prolog query to make the move, which will look as follows:
    // put("#",[0,1],[], [],[["X",_,_,_,_],["X",_,"X",_,_],["X",_,_,_,_],["#","#","#",_,_],[_,_,"#","#","#"]], GrillaRes, FilaSat, ColSat)
    const squaresS = JSON.stringify(this.state.grid).replaceAll('"_"', "_"); // Remove quotes for variables.
    const queryS = 'put('
      + marca 
      + ',[' + i + ',' + j + '],' 
      + JSON.stringify(this.state.pistasEnFilas) + ',' 
      + JSON.stringify(this.state.pistasEnColumnas) + ',' 
      + squaresS
      + ',GrillaRes,FilaSat,ColSat)';
    this.setState({
      waiting: true
    });
    this.pengine.query(queryS, (success, response) => {
      if (success) {
        this.state.listaFilas[i] = response['FilaSat']; 
        this.state.listaColumnas[j] = response['ColSat'];
        this.setState({
          grid: response['GrillaRes'],
          listaFilas: this.state.listaFilas,
          listaColumnas: this.state.listaColumnas,
          waiting: false
        });
        //si todas las pistas de las filas y todas las pistas de las columnas cumplen la condicion el juego fue ganado
        if(this.state.listaFilas.every(this.cumpleCondicion) && 
        this.state.listaColumnas.every(this.cumpleCondicion)){
          this.juegoGanado();
        }
      } 
      else {
        this.setState({
          waiting: false
        });
      }
    });
  }

  cumpleCondicion(valor) {
    return valor === true;
  }

  handleClickOption(valor) {
    if(valor === 'S') {
      this.setState({
        waiting : true,
        mostrandoSolucion : true,
        estadoDelJuego : 'Juego en pausa'
      })
    }
    else {
      this.setState({
        mostrandoSolucion : false,
        waiting : false,
        estadoDelJuego: 'Juego en curso'
      })
    }
    this.setState({seleccion : valor})
  }

  juegoGanado() {
    this.setState({estadoDelJuego: 'Juego ganado!'});
  }

  render() {
    if (this.state.grid === null) {
      return null;
    }
    const marcado = this.state.seleccion;
    const pintar = marcado === '#' ? 'optionPaint' : 'optionPaint deshabilitado';
    const marcar = marcado === 'X' ? 'optionMark' : 'optionMark deshabilitado';
    const pista = marcado === 'P' ? 'opcionPista' : 'opcionPista deshabilitado';
    const solucion = marcado === 'S' ? 'opcionSolucion' : 'opcionSolucion deshabilitado';
    var estadoBotones = this.state.estadoDelJuego === 'Juego ganado!';
    return (
        <div className = "game">
          <div className = "tituloJuego">
            {'NONOGRAMA'}
            <div className = 'botonesAyuda'>
              <button className = {pista} disabled = {estadoBotones} onClick = {() => this.handleClickOption('P')}>
                {'Pista'}
              </button>
              <button className = {solucion} disabled = {estadoBotones} onClick = {() => this.handleClickOption('S')}>
                {'Solucion'}
              </button>
            </div>
          </div>
          <Board
            grid = {this.state.grid}
            grillaResuelta = {this.state.grillaResuelta}
            pistasEnFilas = {this.state.pistasEnFilas} 
            pistasEnColumnas = {this.state.pistasEnColumnas} 
            listaFilas = {this.state.listaFilas}
            listaColumnas = {this.state.listaColumnas}
            estadoDelJuego = {this.state.estadoDelJuego}
            onClickBoard = {(i, j) => this.handleClick(i,j)}
          />
          <div className = "opciones">
            <div className = "gameInfo">
              {this.state.estadoDelJuego}
            </div>
            <div className = "botones">
              <button className = {pintar} disabled = {estadoBotones} onClick = {() => this.handleClickOption('#') }>
                {' '}
              </button>
              <button className = {marcar} disabled = {estadoBotones} onClick = {() => this.handleClickOption('X')}>
                {'X'}
              </button>
            </div>
          </div>
        </div>    
    );
  }
}

export default Game;
