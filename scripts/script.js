let acceptButton = document.querySelector("button");
let rowsEl = document.getElementById("rows");
let colsEl = document.getElementById("columns");
let langSelect = document.querySelector("select");

//the function checks if the matrix dimension is entered correctly, if the data is correct, it returns true, otherwise false
function checkInput() {
    //values of the number of rows and columns
    let rows = Number(rowsEl.value);
    let cols = Number(colsEl.value);
    let lang = langSelect.value;
    if (isNaN(rows) || isNaN(cols)) {
        rowsEl.value = "";
        colsEl.value = "";
        alert(langArr["matSizeError"][lang]);
        throw new Error(langArr["matSizeError"]["en"]);
    };
    if (rows * cols > 10000) {
        rowsEl.value = "";
        colsEl.value = "";
        alert(langArr["hugeMatSize"][lang]);
        throw new Error(langArr["hugeMatSize"]["en"]);
    };
};

//a function that finds all errors in the matrices
function findAllErrors(m, i, j) {
    //check to the end of row i
    for (j_=j; j_ < cols; j_++) {
        let cell = document.getElementById(`${m}/${i}/${j_}`);
        cell = Number(cell.value);
        if (isNaN(cell)) {
            let cell = document.getElementById(`${m}/${i}/${j_}`);
            cell.setAttribute("class", "errorCell");
        };
    };
    //check to the end of matrix m
    for (i_=i+1; i_ < rows; i_++) {
        for (j_=0; j_ < cols; j_++) {
            let cell = document.getElementById(`${m}/${i_}/${j_}`);
            cell = Number(cell.value);
            if (isNaN(cell)) {
                let cell = document.getElementById(`${m}/${i_}/${j_}`);
                cell.setAttribute("class", "errorCell");
            };
        };
    };
    //check to the end of remaining matrices
    for (m_=m+1; m_ < 3; m_++) {
        for (i_=0; i_ < rows; i_++) {
            for (j_=0; j_ < cols; j_++) {
                let cell = document.getElementById(`${m_}/${i_}/${j_}`);
                cell = Number(cell.value);
                if (isNaN(cell)) {
                    let cell = document.getElementById(`${m_}/${i_}/${j_}`);
                    cell.setAttribute("class", "errorCell");
                };
            };
        };
    };
};

//a function that checks if the matrix cells are filled correctly and creates a global object that contains these matrices for calculations
function checkMatrices() {
    matrices_object = {};
    let lang = langSelect.value;
    for (m=1; m < 3; m++) {
        let matrix = [];
        for (i=0; i < rows; i++) {
            let row = [];
            for (j=0; j < cols; j++) {
                let cell = document.getElementById(`${m}/${i}/${j}`);
                cell = Number(cell.value);
                if (isNaN(cell)) {
                    resetStyles();
                    findAllErrors(m, i, j);
                    alert(langArr["matValueError"][lang]);
                    throw new Error(langArr["matValueError"]["en"]);
                };
                row.push(cell);
            };
            matrix.push(row);
        };
        matrices_object[`matrix_array${m}`] = matrix;
    };
};

//function that removes a matrix element from an html document
function clearMatrices() {
    let container1 = document.getElementById("container1");
    let container2 = document.getElementById("container2");
    let findButton = document.getElementById("findButton");
    if (container1 != null) {
        container1.remove();
        container2.remove();
        findButton.remove();
    };
};

//function that creates matrices
function createMatrices() {
    checkInput();
    clearMatrices();
    //language adaptation
    let lang = langSelect.value;
    //creating headlines
    let para1 = document.createElement("h2");
    para1.setAttribute("class", "lang-matrix1");
    para1.textContent = langArr["matrix1"][lang];
    let para2 = document.createElement("h2");
    para2.setAttribute("class", "lang-matrix2");
    para2.textContent = langArr["matrix2"][lang];
    //creating blocks containing matrices with their headlines
    let container1 = document.createElement("div");
    let container2 = document.createElement("div");
    container1.setAttribute("id", "container1");
    container2.setAttribute("id", "container2");
    //creation of matrices of first and second player winnings
    let matrix1 = document.createElement("div");
    let matrix2 = document.createElement("div");
    matrix1.setAttribute("id", "matrix1");
    matrix2.setAttribute("id", "matrix2");
    //class binding for styling
    rows = Number(rowsEl.value);
    cols = Number(colsEl.value);
    matrix1.setAttribute("class", "matrix");
    matrix2.setAttribute("class", "matrix");
    matrix1.style.display = "grid";
    matrix2.style.display = "grid";
    matrix1.style.setProperty("grid-template-columns", `repeat(${cols}, 40px)`);
    matrix2.style.setProperty("grid-template-columns", `repeat(${cols}, 40px)`);
    //filling matrices with cells
    for (i=0; i < rows; i++) {
        for (j=0; j < cols; j++) {
            inp1 = document.createElement("input");
            inp2 = document.createElement("input");
            inp1.setAttribute("type", "text");
            inp2.setAttribute("type", "text");
            //creation of artificial indices for the Nash equilibrium algorithm
            inp1.setAttribute("id", `1/${i}/${j}`);
            inp2.setAttribute("id", `2/${i}/${j}`);
            matrix1.appendChild(inp1);
            matrix2.appendChild(inp2);
        };
    };
    //creating a button for finding Nash equilibria
    let findButton = document.createElement("button");
    findButton.setAttribute("id", "findButton");
    findButton.setAttribute("class", "lang-findEquilibrium")
    findButton.textContent = langArr["findEquilibrium"][lang];
    //binding the event listener when creating the button that finds the Nash equilibrium
    findButton.addEventListener("click", equilibriumNash);
    //forming blocks containing matrices with headlines
    container1.appendChild(para1);
    container1.appendChild(matrix1);
    container2.appendChild(para2);
    container2.appendChild(matrix2);
    //output elements in html document
    let mainBlock = document.querySelector("main");
    mainBlock.append(container1);
    mainBlock.append(container2);
    mainBlock.append(findButton);
};

//an auxiliary function that returns the nth column of the matrix
function giveColumn(mat, n) {
    let col = [];
    for (row in mat) {
        col.push(mat[row][n]);
    };
    return col;
};

//is an auxiliary function for finding the maximum in the array
function getMaxOfArray(array) {
    return Math.max.apply(null, array);
};

//function that returns the intersection of two arrays
function intersection(array1, array2) {
    intersectionArray = [];
    for (i=0; i < array1.length; i++) {
        for (j=0; j < array2.length; j++) {
            if (array1[i][0] === array2[j][0] && array1[i][1] === array2[j][1]) {
                intersectionArray.push(array1[i]);
            };
        };
    };
    return intersectionArray;
};

//reset matrix cell styles
function resetStyles() {
    let equilibriums = document.getElementsByClassName("equilibrium");
    let errorCell = document.getElementsByClassName("errorCell");
    while (equilibriums.length != 0) {
        equilibriums[0].className = "";
    };
    while (errorCell.length != 0) {
        errorCell[0].className = "";
    };
};

//filling the cells of the matrix with Nash equilibrium in green
function markUpGreen(indices_array) {
    indices_array.forEach(indices => {
        let index = indices.toString();
        index = index.replace(",", "/");
        let cell1 = document.getElementById(`1/${index}`);
        let cell2 = document.getElementById(`2/${index}`);
        cell1.setAttribute("class", "equilibrium");
        cell2.setAttribute("class", "equilibrium");
    });
};

//algorithm for finding Nash equilibria in a bimatrix game
function equilibriumNash() {
    //check for the correctness of the matrix cells
    checkMatrices();
    //style reset
    resetStyles();
    //sets storing the indices of the optimal moves of each of the players
    let optimum1 = new Set();
    let optimum2 = new Set();
    //finding the optimal moves of the first player
    for (j=0; j < cols; j++) {
        col_j = giveColumn(matrices_object["matrix_array1"], j);
        let max_val = getMaxOfArray(col_j);
        for (i=0; i < rows; i++) {
            if (col_j[i] == max_val) {
                let max_indices = [i, j];
                optimum1.add(max_indices);
            };
        };
    };
    //finding the optimal moves of the second player
    for (i=0; i < rows; i++) {
        let row_i = matrices_object["matrix_array2"][i];
        let max_val = getMaxOfArray(row_i);
        for (j=0; j < cols; j++) {
            if (row_i[j] == max_val) {
                let max_indices = [i, j];
                optimum2.add(max_indices);
            };
        };
    };
    //finding the intersection of the sets
    optimum1 = Array.from(optimum1);
    optimum2 = Array.from(optimum2);
    let equilibriums = intersection(optimum1, optimum2);
    //highlighting of the cells with Nash equilibrium in green
    markUpGreen(equilibriums);
};

//function that changes the language
function changeLanguage() {
    let lang = langSelect.value;
    document.title = langArr["title"][lang];
    for (key in langArr) {
        let elem = document.querySelector(`.lang-${key}`);
        if (elem != null) {
            elem.textContent = langArr[key][lang];
        };
    };
};

//listener to pressing the "Accept" button
acceptButton.addEventListener("click", createMatrices);
//listener to changing the language
langSelect.addEventListener("change", changeLanguage);