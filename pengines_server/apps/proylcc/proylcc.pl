:- module(proylcc,
	[  
		put/8
	]).

:-use_module(library(lists)).

%Agrega como a una lista un elmento como primer elemento.
%Idealmente recibe: Un elemento X y una lista L.
%Salida esperada:   Una nueva lista con primer elemento X y cola L.
agregar(X,[],R)   :- R = [X].
agregar(X,[H|T],R):- R = [X,H|T].

agregarFinal(X,[],R):- R = [X].
agregarFinal(X,[H|T],R):- agregarFinal(X,T,Raux), R = [H|Raux].

replace(X, 0, Y, [X|Xs], [Y|Xs]).
replace(X, XIndex, Y, [Xi|Xs], [Xi|XsY]):-
    XIndex > 0,
    XIndexS is XIndex - 1,
    replace(X, XIndexS, Y, Xs, XsY).

%Lee una matriz y devuelve una columna en forma de lista.
% Idealmente recibe: Una lista de listas (Matriz) M y una posicion P.
% Salida esperada: Una lista con los elementos de la posicion P en M.
listarCol([],_Pos,Lista)  :- Lista = [].
listarCol([H|T],Pos,Lista):- obtenerPos(Pos,H,Elemento),
                             listarCol(T,Pos,ListaAux),
                             agregar(Elemento,ListaAux,Lista).

%Obtiene una posicion de una lista.
% Idealmente recibe: Una posicion P y una lista L.
% Salida esperada:  La posicion P en L.
obtenerPos(0,L,R):-L = [H|_T], R = H.
obtenerPos(N,L,R):-L = [_H|T], N > 0, S is N-1, obtenerPos(S,T,R).

%Genera una lista que representa una pista.
% Idealmente recibe: Una lista L, longitud actual de la pista N.
% Salida esperada: Una Pista y el Resto de la lista que no se recorrio.
generarPista([],N,Pista,Resto)   :- Resto = [],Pista = [N].
generarPista([H|T],N,Pista,Resto):- H == "#",S is N+1,generarPista(T,S,Pista,Resto);
                                    Resto = T,Pista = [N].

%Genera una lista de pistas a traves de una fila de una matriz.
% Idealmente recibe: Una fila de una matriz.
% Salida esperada: Una lista de pistas.
generarListaPista([],ListaPista)  :- ListaPista = [],!.
generarListaPista(Fila,ListaPista):- Fila \==[], generarPista(Fila,0,Pista,Resto),
                                     generarListaPista(Resto,ListaAux),
                                     Pista = [H], (H \== 0, agregar(H,ListaAux,ListaPista);ListaPista = ListaAux).

%Modifica una Grilla y evalua el movimiento.
% Idealmente recibe: Un contenido, una posicion, pistas que deben
% respetar filas y columnas.
% Salida esperada: Una nueva Grilla modificada y dos valores que indican
% si se satisfacen las pistas en las filas y en las columnas.
put(Contenido, [RowN, ColN], PistasFilas, PistasColumnas, Grilla, NewGrilla, FilaSat, ColSat):- obtenerPos(RowN,Grilla,Row),
                                                                                                obtenerPos(RowN,PistasFilas,PistaF),
                                                                                                obtenerPos(ColN,PistasColumnas,PistaC),

                                                                                                (replace(Cell, ColN, _, Row, NewRow),Cell == Contenido;
                                                                                                replace(_Cell, ColN, Contenido, Row, NewRow)),
                                                                                                replace(_Row, RowN, NewRow, Grilla, NewGrilla),

                                                                                                listarCol(NewGrilla,ColN,NewCol),

                                                                                                generarListaPista(NewRow,FilaPista),
                                                                                                generarListaPista(NewCol,ColPista),

                                                                                                (ColPista = PistaC,ColSat = true;ColSat = false),
                                                                                                (FilaPista = PistaF,FilaSat = true;FilaSat = false).

resolverGrilla(PistasF,PistasC,Grilla,GrillaRes,CantF,CantC):-  
                                                               resolverFilas(PistasF,Grilla,GrillaAux,CantF),
                                                               traspuesta(GrillaAux,GrillaTraspuesta,CantC),
                                                               resolverFilas(PistasC,GrillaTraspuesta,GrillaAux2,CantC),
                                                               traspuesta(GrillaAux2,GrillaResAux2,CantF),
                                                               verificarFilas(PistasF,GrillaResAux2,Sat,CantF),
                                                               (Sat = true,GrillaRes = GrillaResAux2;
                                                               resolverGrilla(PistasF,PistasC,GrillaResAux2,GrillaRes,CantF,CantC)).

verificarFilas([],[],Sat,-1):- Sat = true,!.
verificarFilas([P|RestoP],[F|RestoF],Sat,N):- S is N-1, generarListaPista(F,Pista), P = Pista, 
                                              verificarFilas(RestoP,RestoF,Sat,S); Sat = false.
                                                               

resolverFilas(_PistasF,Grilla,GrillaRes,-1):-GrillaRes = Grilla,!.
resolverFilas(PistasF,Grilla,GrillaRes,Pos):-obtenerPos(Pos,PistasF,Pista),obtenerPos(Pos,Grilla,Fila),
                                             generarListaPosibilidades(Fila,Pista,ListaPosibilidades),longitud(Fila,Long),
                                             resolverLinea(ListaPosibilidades,LineaModificada,Long),
                                             replace(_Fila,Pos,LineaModificada,Grilla,GrillaModificada),
                                             S is Pos-1,resolverFilas(PistasF,GrillaModificada,GrillaRes,S).

traspuesta(_Matriz,MatrizTraspuesta,-1):-MatrizTraspuesta = [],!.
traspuesta(Matriz,MatrizTraspuesta,Pos):-listarCol(Matriz,Pos,Col),S is Pos-1,traspuesta(Matriz,MatrizAux,S), agregarFinal(Col,MatrizAux,MatrizTraspuesta).

resolverLinea(_ListaPosibilidades,LineaResuelta,-1):- LineaResuelta = [],!.
resolverLinea(ListaPosibilidades,LineaResuelta,Long):-S is Long -1,resolverLinea(ListaPosibilidades,LineaAux,S),
                                                      (forall(member(Posibilidad,ListaPosibilidades),obtenerPos(Long,Posibilidad,"#")),
                                                      append(LineaAux,["#"],LineaResuelta);
                                                      forall(member(Posibilidad,ListaPosibilidades),obtenerPos(Long,Posibilidad,"X")),
                                                      append(LineaAux,["X"],LineaResuelta);
                                                      append(LineaAux,[_],LineaResuelta)).

generarListaPosibilidades(Fila,Pista,ListaPosibilidades):-findall(Fila,generarPosibilidad(Fila,Pista),ListaPosibilidades).

generarPosibilidad([],[]):-!.
generarPosibilidad(Fila,[PistaActual|Resto]):- espaciar(Fila,FilaAux),
                                               agregarPista(FilaAux,FilaConPista,PistaActual),
                                               (Resto\=[], agregarEspacio(FilaConPista,FilaConPistayEspacio);
                                               Resto==[], espaciar(FilaConPista,FilaConPistayEspacio)),
                                               generarPosibilidad(FilaConPistayEspacio,Resto).
agregarPista(Linea,Linea, 0).
agregarPista(["#"|Linea], RestoLinea, N):-N > 0,S is N - 1,
                                          agregarPista(Linea, RestoLinea, S).


espaciar(Linea, Linea).
espaciar(["X"|Linea],RestoLinea) :- espaciar(Linea, RestoLinea).


longitud([],R):- R is -1.
longitud([_H|T],R):- longitud(T,Raux), R is Raux + 1.


agregarEspacio(["X"|T],T).