// ==========================================
// N-QUEENS AI
// Drag + Drop + CSP + Backtracking
// ==========================================

const board = document.getElementById("board");
const sizeSelect = document.getElementById("boardSize");
const queenCount = document.getElementById("queenCount");
const statusText = document.getElementById("status");
const reasoningBox = document.getElementById("reasoningBox");

let N = 8;
let queens = [];
let aiSolving = false;
let draggedQueen = null;


// ==========================================
// CREATE BOARD
// ==========================================

function createBoard() {

    N = parseInt(sizeSelect.value);

    queens = new Array(N).fill(-1);

    aiSolving = false;
    draggedQueen = null;

    board.innerHTML = "";

    board.style.display = "grid";
    board.style.gridTemplateColumns = `repeat(${N}, 1fr)`;
    board.style.gridTemplateRows = `repeat(${N}, 1fr)`;


    // Create cells
    for (let row = 0; row < N; row++) {

        for (let col = 0; col < N; col++) {

            const cell = document.createElement("div");

            cell.classList.add("cell");

            cell.dataset.row = row;
            cell.dataset.col = col;


            if ((row + col) % 2 === 0) {
                cell.classList.add("light");
            } else {
                cell.classList.add("dark");
            }


            // Allow dropping
            cell.addEventListener("dragover", function(event) {

                event.preventDefault();

                if (!aiSolving) {
                    cell.classList.add("drop-target");
                }

            });


            cell.addEventListener("dragleave", function() {

                cell.classList.remove("drop-target");

            });


            cell.addEventListener("drop", function(event) {

                event.preventDefault();

                cell.classList.remove("drop-target");

                if (aiSolving) {
                    return;
                }

                const newRow =
                    parseInt(cell.dataset.row);

                const newCol =
                    parseInt(cell.dataset.col);

                moveQueen(newRow, newCol);

            });


            // Clicking an empty square places a queen
            cell.addEventListener("click", function() {

                if (aiSolving) {
                    return;
                }

                const row =
                    parseInt(cell.dataset.row);

                const col =
                    parseInt(cell.dataset.col);

                if (queens[row] === -1) {
                    placeQueen(row, col);
                }

            });


            board.appendChild(cell);
        }
    }


    reasoningBox.innerHTML = `
        <p>🧠 <b>Welcome to N-Queens AI!</b></p>
        <p>Drag a queen to move it.</p>
        <p>Place all ${N} queens so that no two queens attack each other.</p>
        <p>🟢 Safe position &nbsp;&nbsp; 🔴 Conflict</p>
    `;


    statusText.textContent =
        "Click a square to place your first queen.";


    updateCounter();

    drawBoard();
}


// ==========================================
// CHECK POSITION
// ==========================================

function isSafe(row, col, ignoreRow = -1) {

    for (let r = 0; r < N; r++) {

        if (r === ignoreRow) {
            continue;
        }

        const c = queens[r];

        if (c === -1) {
            continue;
        }


        // Same column
        if (c === col) {
            return false;
        }


        // Same diagonal
        if (
            Math.abs(r - row) ===
            Math.abs(c - col)
        ) {
            return false;
        }
    }


    return true;
}


// ==========================================
// GET REASON FOR CONFLICT
// ==========================================

function getConflictReason(row, col, ignoreRow = -1) {

    for (let r = 0; r < N; r++) {

        if (r === ignoreRow) {
            continue;
        }

        const c = queens[r];

        if (c === -1) {
            continue;
        }


        if (c === col) {

            return `same column as Queen at Row ${r + 1}, Column ${c + 1}`;

        }


        if (
            Math.abs(r - row) ===
            Math.abs(c - col)
        ) {

            return `same diagonal as Queen at Row ${r + 1}, Column ${c + 1}`;

        }
    }


    return "unknown conflict";
}


// ==========================================
// PLACE NEW QUEEN
// ==========================================

function placeQueen(row, col) {

    if (!isSafe(row, col)) {

        const reason =
            getConflictReason(row, col);

        addReasoning(
            `❌ Cannot place Queen at Row ${row + 1}, Column ${col + 1}: ${reason}.`,
            "error"
        );

        statusText.textContent =
            "❌ Invalid position.";

        return;
    }


    queens[row] = col;


    addReasoning(
        `✓ Queen placed at Row ${row + 1}, Column ${col + 1}.`,
        "success"
    );


    drawBoard();

    updateCounter();


    if (allQueensPlaced()) {

        checkSolution();

    } else {

        statusText.textContent =
            "You can place or move queens. Try to complete the puzzle.";
    }
}


// ==========================================
// DRAG START
// ==========================================

function startDragging(event, row) {

    if (aiSolving) {
        return;
    }


    draggedQueen = row;

    event.dataTransfer.effectAllowed = "move";

    event.dataTransfer.setData(
        "text/plain",
        row.toString()
    );


    event.target.style.opacity = "0.4";


    addReasoning(
        `♛ Moving Queen from Row ${row + 1}, Column ${queens[row] + 1}...`
    );
}


// ==========================================
// DRAG END
// ==========================================

function finishDragging(event) {

    event.target.style.opacity = "1";

}


// ==========================================
// MOVE QUEEN
// ==========================================

function moveQueen(newRow, newCol) {

    if (draggedQueen === null) {
        return;
    }


    const oldRow = draggedQueen;
    const oldCol = queens[oldRow];


    draggedQueen = null;


    // Don't drop onto the exact same position
    if (
        oldRow === newRow &&
        oldCol === newCol
    ) {

        statusText.textContent =
            "Queen returned to its original position.";

        return;
    }


    // If another queen already occupies destination
    if (
        queens[newRow] !== -1 &&
        newRow !== oldRow
    ) {

        addReasoning(
            `❌ Row ${newRow + 1}, Column ${newCol + 1} already contains a queen.`,
            "error"
        );

        statusText.textContent =
            "❌ That square is occupied.";

        return;
    }


    // Temporarily remove old queen
    queens[oldRow] = -1;


    // Check new position
    if (!isSafe(newRow, newCol)) {

        const reason =
            getConflictReason(newRow, newCol);


        // Put queen back
        queens[oldRow] = oldCol;


        addReasoning(
            `❌ Move rejected: ${reason}.`,
            "error"
        );


        statusText.textContent =
            "❌ Invalid move. Queen returned.";


        drawBoard();

        updateCounter();

        return;
    }


    // Valid move
    queens[newRow] = newCol;


    addReasoning(
        `✓ Queen moved from Row ${oldRow + 1}, Column ${oldCol + 1} to Row ${newRow + 1}, Column ${newCol + 1}.`,
        "success"
    );


    addReasoning(
        "✓ New position satisfies the CSP constraints."
    );


    statusText.textContent =
        `Queen moved to Row ${newRow + 1}, Column ${newCol + 1}.`;


    drawBoard();

    updateCounter();


    if (allQueensPlaced()) {
        checkSolution();
    }
}


// ==========================================
// DRAW BOARD
// ==========================================

function drawBoard() {

    const cells =
        board.querySelectorAll(".cell");


    cells.forEach(function(cell) {

        cell.innerHTML = "";

        cell.classList.remove(
            "safe",
            "attacked",
            "drop-target"
        );

    });


    // Show safe/conflicting positions
    // for empty squares
    for (let row = 0; row < N; row++) {

        for (let col = 0; col < N; col++) {

            const index =
                row * N + col;

            const cell =
                cells[index];


            if (queens[row] === col) {
                continue;
            }


            if (queens[row] === -1) {

                if (isSafe(row, col)) {
                    cell.classList.add("safe");
                } else {
                    cell.classList.add("attacked");
                }
            }
        }
    }


    // Draw queens
    for (let row = 0; row < N; row++) {

        const col = queens[row];


        if (col === -1) {
            continue;
        }


        const index =
            row * N + col;


        const queen =
            document.createElement("span");


        queen.classList.add("queen");

        queen.textContent = "♛";

        queen.draggable = true;


        // Drag events
        queen.addEventListener(
            "dragstart",
            function(event) {

                startDragging(event, row);

            }
        );


        queen.addEventListener(
            "dragend",
            function(event) {

                finishDragging(event);

            }
        );


        cells[index].appendChild(queen);
    }
}


// ==========================================
// CHECK ALL QUEENS
// ==========================================

function checkSolution() {

    const count =
        queens.filter(q => q !== -1).length;


    if (count < N) {

        addReasoning(
            `⚠️ ${count} of ${N} queens are placed. ${N - count} more needed.`,
            "error"
        );


        statusText.textContent =
            `Place all ${N} queens first.`;

        return false;
    }


    // Check every pair
    for (let r1 = 0; r1 < N; r1++) {

        for (
            let r2 = r1 + 1;
            r2 < N;
            r2++
        ) {

            if (
                queens[r1] ===
                queens[r2]
            ) {

                addReasoning(
                    `❌ Column conflict between Row ${r1 + 1} and Row ${r2 + 1}.`,
                    "error"
                );

                return false;
            }


            if (
                Math.abs(r1 - r2) ===
                Math.abs(
                    queens[r1] -
                    queens[r2]
                )
            ) {

                addReasoning(
                    `❌ Diagonal conflict between Row ${r1 + 1} and Row ${r2 + 1}.`,
                    "error"
                );

                return false;
            }
        }
    }


    addReasoning(
        "🎉 SUCCESS! All queens satisfy the CSP constraints!",
        "success"
    );


    statusText.textContent =
        "🎉 Puzzle Solved!";


    return true;
}


// ==========================================
// CHECK IF ALL QUEENS ARE PLACED
// ==========================================

function allQueensPlaced() {

    return queens.every(
        q => q !== -1
    );
}


// ==========================================
// AI SOLVER
// ==========================================

async function solveAI(row) {

    if (row === N) {
        return true;
    }


    for (let col = 0; col < N; col++) {

        addReasoning(
            `🤖 Trying Row ${row + 1}, Column ${col + 1}...`
        );


        await wait(250);


        if (!isSafe(row, col)) {

            addReasoning(
                `❌ Rejected: ${getConflictReason(row, col)}.`,
                "error"
            );


            await wait(150);

            continue;
        }


        // Place queen
        queens[row] = col;


        drawBoard();

        updateCounter();


        addReasoning(
            `✓ Safe! Queen placed at Row ${row + 1}, Column ${col + 1}.`,
            "success"
        );


        await wait(450);


        // Solve next row
        if (await solveAI(row + 1)) {

            return true;
        }


        // Backtracking
        addReasoning(
            `↩ Backtracking from Row ${row + 1}, Column ${col + 1}.`,
            "error"
        );


        queens[row] = -1;


        drawBoard();

        updateCounter();


        await wait(400);
    }


    return false;
}


// ==========================================
// SOLVE WITH AI
// ==========================================

async function startAI() {

    if (aiSolving) {
        return;
    }


    aiSolving = true;


    queens = new Array(N).fill(-1);


    reasoningBox.innerHTML = "";


    addReasoning(
        "🤖 AI Solver Started"
    );


    addReasoning(
        "Constraint 1: No two queens can share a column."
    );


    addReasoning(
        "Constraint 2: No two queens can share a diagonal."
    );


    addReasoning(
        "🧠 CSP Backtracking is searching for a solution..."
    );


    statusText.textContent =
        "🤖 AI is solving...";


    updateCounter();

    drawBoard();


    const solved =
        await solveAI(0);


    if (solved) {

        addReasoning(
            "🎉 AI found a valid N-Queens solution!",
            "success"
        );


        statusText.textContent =
            "🎉 AI solved the puzzle!";

    } else {

        addReasoning(
            "❌ No solution exists.",
            "error"
        );


        statusText.textContent =
            "No solution exists.";
    }


    aiSolving = false;


    drawBoard();
}


// ==========================================
// REASONING MESSAGE
// ==========================================

function addReasoning(message, type = "normal") {

    const p =
        document.createElement("p");


    p.textContent = message;


    if (type === "error") {

        p.style.color = "#ff4d4d";
    }


    if (type === "success") {

        p.style.color = "#22c55e";
    }


    reasoningBox.appendChild(p);


    reasoningBox.scrollTop =
        reasoningBox.scrollHeight;
}


// ==========================================
// QUEEN COUNTER
// ==========================================

function updateCounter() {

    const count =
        queens.filter(
            q => q !== -1
        ).length;


    queenCount.textContent =
        `Queens: ${count} / ${N}`;
}


// ==========================================
// WAIT
// ==========================================

function wait(ms) {

    return new Promise(
        resolve => setTimeout(resolve, ms)
    );
}


// ==========================================
// NEW GAME
// ==========================================

document
    .getElementById("newGame")
    .onclick = function() {

        createBoard();

    };


// ==========================================
// RESET
// ==========================================

document
    .getElementById("reset")
    .onclick = function() {

        createBoard();

    };


// ==========================================
// CHECK
// ==========================================

document
    .getElementById("check")
    .onclick = function() {

        checkSolution();

    };


// ==========================================
// SOLVE WITH AI
// ==========================================

document
    .getElementById("solve")
    .onclick = function() {

        startAI();

    };


// ==========================================
// BOARD SIZE
// ==========================================

sizeSelect.onchange = function() {

    createBoard();

};


// ==========================================
// START
// ==========================================

createBoard();
