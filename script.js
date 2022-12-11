let acceptButton = document.querySelector("button");
let rowsEl = document.getElementById("rows");
let colsEl = document.getElementById("columns");

//функция проверяет правильность ввода размерности матрицы, если данные введены верно, то возвращает true, иначе false
function checkInput() {
    //значения количества строк и столбцов
    rows = Number(rowsEl.value);
    cols = Number(colsEl.value);
    if (isNaN(rows) || isNaN(cols)) {
        rowsEl.value = "";
        colsEl.value = "";
        return false;
    };
    return true;
  };

//функция, проверяющая правильность заполненности ячеек матриц, а также создающая глобальный объект, содержащий эти матрицы для рассчетов
function checkMatrices() {
    matrices_object = {};
    for (m=1; m < 3; m++) {
        let matrix = [];
        for (i=0; i < rows; i++) {
            let row = [];
            for (j=0; j < cols; j++) {
                let cell = document.getElementById(`${m}/${i}/${j}`);
                cell = Number(cell.value);
                if (isNaN(cell)) {
                    let cell = document.getElementById(`${m}/${i}/${j}`);
                    cell.setAttribute("class", "errorCell");
                    return false;
                };
                row.push(cell);
            };
            matrix.push(row);
        };
        matrices_object[`matrix_array${m}`] = matrix;
    };
    return true;
};

//функция, удаляющая элемент матрицы из html документа
function clearMatrices() {
    let container1 = document.getElementById("container1");
    let container2 = document.getElementById("container2");
    let findButton = document.getElementById("findButton")
    if (container1 != null) {
        container1.remove();
        container2.remove();
        findButton.remove();
    };
};

//функция, создающая матрицы
function createMatrices() {
    if (!checkInput()) {
        alert("Неправильно введены данные");
        throw new Error("Неправильно введены данные");
    };
    clearMatrices();
    //создание заголовков
    let para1 = document.createElement("h2");
    para1.textContent = "Матрица выигрышей первого игрока";
    let para2 = document.createElement("h2");
    para2.textContent = "Матрица выигрышей второго игрока"
    //создание блоков, содержащих матрицы с их заголовками
    let container1 = document.createElement("div");
    let container2 = document.createElement("div");
    container1.setAttribute("id", "container1");
    container2.setAttribute("id", "container2");
    //создание матриц выигрышей первого и второго игрока
    let matrix1 = document.createElement("div");
    let matrix2 = document.createElement("div");
    matrix1.setAttribute("id", "matrix1");
    matrix2.setAttribute("id", "matrix2");
    //привязка класса для стилизации
    matrix1.setAttribute("class", "matrix");
    matrix2.setAttribute("class", "matrix");
    matrix1.style.display = "grid";
    matrix2.style.display = "grid";
    matrix1.style.setProperty("grid-template-columns", `repeat(${cols}, 40px)`);
    matrix2.style.setProperty("grid-template-columns", `repeat(${cols}, 40px)`);
    //заполнение матриц ячейками
    for (i=0; i < rows; i++) {
        for (j=0; j < cols; j++) {
            inp1 = document.createElement("input");
            inp2 = document.createElement("input");
            inp1.setAttribute("type", "text");
            inp2.setAttribute("type", "text");
            //создание искусственных индексов для алгоритма нахождения равновесий Нэша
            inp1.setAttribute("id", `1/${i}/${j}`);
            inp2.setAttribute("id", `2/${i}/${j}`);
            matrix1.appendChild(inp1);
            matrix2.appendChild(inp2);
        };
    };
    //создание кнопки для нахождения равновесий Нэша
    let findButton = document.createElement("button");
    findButton.setAttribute("id", "findButton");
    findButton.textContent = "Найти равновесия Нэша";
    //привязываем слушатель событий при создании кнопки, которая находит равновесия Нэша
    findButton.addEventListener("click", equilibriumNash);
    //формирование блоков, содержащих матрицы с заголовками
    container1.appendChild(para1);
    container1.appendChild(matrix1);
    container2.appendChild(para2);
    container2.appendChild(matrix2);
    //вывод элементов в html документ
    document.body.append(container1);
    document.body.append(container2);
    document.body.append(findButton);
  };

//вспомогательная функция, возвращающая n-ый столбец матрицы
function giveColumn(mat, n) {
    let col = [];
    for (row in mat) {
        col.push(mat[row][n]);
    };
    return col;
};

//вспомогательная функция для нахождения максимума в массиве
function getMaxOfArray(array) {
    return Math.max.apply(null, array);
};

//фуекция, возвращающая пересечение двух массивов
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

//сброс стилей ячеек матриц
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

//заливка ячеек матрицы с равновесием Нэша зеленым цветом
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

//алгоритм нахождения равновесий Нэша в биматричной игре
function equilibriumNash() {
    //проверка на правильность заполненности ячеек матриц
    if (!checkMatrices()) {
        alert("Неправильно введены значения матрицы");
        throw new Error("Неправильно введены значения матрицы");
    };
    //обнуление стилей
    resetStyles();
    //множества, хранящие индексы оптимальных ходов каждого из игроков
    let optimum1 = new Set();
    let optimum2 = new Set();
    //поиск оптимальных ходов первого игрока
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
    //поиск оптимальных ходов второго игрока
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
    //находим пересечение множеств
    optimum1 = Array.from(optimum1);
    optimum2 = Array.from(optimum2);
    let equilibriums = intersection(optimum1, optimum2);
    //подсвечиваем ячейки с равновесием зеленым цветом
    markUpGreen(equilibriums);
};

//слушатель на нажатие кнопки "Принять"
acceptButton.addEventListener("click", createMatrices);