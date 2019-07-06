import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
    const filledValue = props.value === 'X' ? ' filled filled-x' :
        props.value ==='O' ? ' filled filled-o' : '';
    const winClass = props.winSequence ? ' win ' : '';
    const isDisabled = !!props.value || props.gameEnd;

    return (
        <button className={'square'+ filledValue + winClass} onClick={props.onClick} disabled={isDisabled}>
            {props.value}
        </button>
    )
}
function Draw(props) {
    if (props.isDraw) {
        return (
            <div className="draw">
                Draw!
            </div>
        );
    }

    return (null);
}
class Board extends React.Component {
    renderSquare(i) {
        const winSequence = this.props.winSequence ? this.props.winSequence.indexOf(i) > -1 : null;
        const isGameEnd = !!this.props.winSequence;

        return (
            <Square
                key={i}
                value={this.props.squares[i]}
                winSequence={winSequence}
                gameEnd={isGameEnd}
                onClick={() => this.props.onClick(i)}
            />
        );
    }

    render() {
        const board = [];
        const rowsLength = 3;
        const colsLength = 3;
        for (let i = 0; i < rowsLength; i++) {
            const squares = [];
            for (let j = i * rowsLength; j < i * rowsLength + colsLength; j++) {
                squares.push(this.renderSquare(j))
            }
            board.push(<div className="board-row" key={i}>{squares}</div>);
        }

        return board;
    }
}



class Game extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            history: [{
                squares: Array(9).fill(null),
                lastMove: -1
            }],
            stepNumber: 0,
            xIsNext: true,
            sortAscend: true,
        };
    }

    handleClick(i) {
        const history = this.state.history.slice(0, this.state.stepNumber + 1);
        const current = history[history.length - 1];
        const squares = current.squares.slice();

        if (calculateWinResult(squares).winner || squares[i]){
            return;
        }
        squares[i] = this.state.xIsNext ? 'X' : 'O';
        this.setState({
            history: history.concat([{
                squares: squares,
                lastMove: i
            }]),
            stepNumber: history.length,
            xIsNext: !this.state.xIsNext
        });
    }
    jumpTo(step) {
        this.setState({
            stepNumber: step,
            xIsNext: (step % 2) === 0,
        })
    }
    handleToggle() {
        this.setState({
            sortAscend: !this.state.sortAscend
        })
    }

    render() {
        const rowsLength = 3;
        const {history} = this.state;
        const {squares} = history[this.state.stepNumber];
        const {winner} = calculateWinResult(squares);
        const {winSequence} = calculateWinResult(squares);
        const moves = [];
        const isSortAscend = this.state.sortAscend;
        const currentStep = this.state.stepNumber;

        for (let i = 0; i < history.length; i++) {
            const isGameStart = i === 0;
            const move = isSortAscend || isGameStart ? i : history.length - i;
            const isToggled = currentStep === move ? ' toggled' : '';
            const {lastMove} = history[move];
            const moveRow = (lastMove / rowsLength | 0) + 1;
            const moveCol = lastMove % rowsLength + 1;
            const desc = move ?
                `Go to move #${move} (${moveRow}, ${moveCol})`:
                'Go to game start';

            moves.push(
                <li key={move}>
                    <
                        button
                        className={"button" + isToggled}
                        onClick={() => this.jumpTo(move)}
                    >{desc}</button>
                </li>
            )
        }

        let status;
        if (winner) {
            status = 'Winner: ' + winner;
        } else {
            status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
        }
        const isDraw = squares.every(square => square) && !winner;

        return (
            <div className="game">
                <div className="game-board">
                    <Board
                        squares={squares}
                        winSequence={winSequence}
                        onClick={(i) => this.handleClick(i)}
                    />
                    <Draw isDraw={isDraw}/>
                </div>
                <div className="game-info">
                    <div>{status}</div>
                    <ol>{moves}</ol>
                    <button className="sort" onClick={() => this.handleToggle()}>↑↓ Sort moves</button>
                </div>
            </div>
        );
    }
}

// ========================================

ReactDOM.render(
    <Game />,
    document.getElementById('root')
);


function calculateWinResult(squares) {
    const lines = [
        [0,1,2],
        [3,4,5],
        [6,7,8],
        [0,3,6],
        [1,4,7],
        [2,5,8],
        [0,4,8],
        [2,4,6]
    ];
    for (let i = 0; i < lines.length; i++) {
        const [a,b,c] = lines[i];
        if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c] ) {
            return {
                winner: squares[a],
                winSequence: lines[i]
            };
        }
    }
    return {
        winner: null,
        winSequence: null
    };
}