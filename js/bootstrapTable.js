let table; //Таблица данных
let endBtable; //Элемент окончания таблицы
let data; //Данные JSON

//Данный для ленивой загрузки
let dataCount;
let pagesTotal = 0;
let pageCurrent = 0;
let rowsToPage = 50;

//В данный момент идет процесс поиска
let itsSearchProcess = false;

//Настройки по умолчанию.
//Применяются, если не были указаны настройки
let optionsDefault = {
    itemsToPage: 50,
    //headRow:['id', 'Name', 'Email', 'Phone']
};


/**
 * Начальная инициализация таблицы
 * @param {*} idTable 
 * @param {*} datat 
 * @param {*} options 
 */
function initBtable(idTable, datat, options = optionsDefault) {
    try {
        table = document.getElementById(idTable);
        data = datat;
        calculatePages(options);
        let pnode = table.parentNode; //Контейнер, в который была помещена таблица
    
        //Создаём новый контейнер для элементов и таблицы
        let container = document.createElement('div');
    
        //Оборачиваем таблицу в контейнер
        let contTable = document.createElement('div');
        contTable.style.overflowX = 'auto';
        contTable.classList.add('mt-3');
        contTable.append(table);
    
        //Создаём элемент для отслеживания окончания таблицы при пролистывании
        endBtable = document.createElement('span');
        endBtable.id = 'endBtable';
    
        contTable.append(table);
        contTable.append(endBtable);
    
        container.append(headerTable(options));
        container.append(contTable);
        container.append(footerTable(options));
        pnode.append(container);
    
        createHead(options);
        addFirstRows();
    } catch (error) {
        alert(`При инициализации произошла ошибка: ${error}`)
    }
}

window.addEventListener('scroll', tableScroll);

/**
 * Отображение начальных строк в таблице, при инициализации и после очистки поля для поиска
 */
function addFirstRows() {
    if (dataCount > rowsToPage) {
        for (let i = 0; i < rowsToPage; i++) {
            insertRow(data[i]);
        }
    } else {
        for (let i = 0; i < data.length; i++) {
            insertRow(data[i]);
        }
    }
}

/**
 * Получаем количество страниц ленивой загрузки
 * @param {*} options 
 */
function calculatePages(options) {
    if (options.itemsToPage != undefined) {
        rowsToPage = parseInt(options.itemsToPage);
    }
    dataCount = data.length;
    pagesTotal = dataCount / rowsToPage;
    if (dataCount % rowsToPage > 0) {
        pagesTotal++;
    }
    console.log('Total pages: ' + pagesTotal);
    console.log('Items count: ' + dataCount);
}

/**
 * Добавляет строку в таблицу
 * @param {*} dataItem 
 */
function insertRow(dataItem) {
    let row = table.insertRow();
    for (let key in dataItem) {
        row.innerHTML += `<td>${dataItem[key]}</td>`;
    }
}

/**
 * Создание строки заголовка таблицы
 * @param {*} options 
 */
function createHead(options) {
    let thead = table.querySelector('thead');
    if (thead === null) {
        if (options.headRow != undefined) {
            thead = table.createTHead();
            let row = thead.insertRow();
            for (let i = 0; i < options.headRow.length; i++) {
                row.innerHTML += addHeaderCell(options.headRow[i]);
            }
        } else {
            thead = table.createTHead();
            let row = thead.insertRow();
            for (let key in data[0]) {
                //если не указан хедер то устанавливаем из названия полей
                row.innerHTML += addHeaderCell(key);
            }
        }
    }
}

/**
 * Создаёт ячейку для заголовка таблицы
 * @param {*} name 
 * @returns 
 */
function addHeaderCell(name){
    return `<th><span class="d-flex justify-content-between align-items-center">
    <span>${name}</span>
    <button type="button" class="btn btn-outline-primary border-0">
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-down-up" viewBox="0 0 16 16">
    <path fill-rule="evenodd" d="M11.5 15a.5.5 0 0 0 .5-.5V2.707l3.146 3.147a.5.5 0 0 0 .708-.708l-4-4a.5.5 0 0 0-.708 0l-4 4a.5.5 0 1 0 .708.708L11 2.707V14.5a.5.5 0 0 0 .5.5zm-7-14a.5.5 0 0 1 .5.5v11.793l3.146-3.147a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 0 1 .708-.708L4 13.293V1.5a.5.5 0 0 1 .5-.5z"/>
    </svg>
    </button>
    </span></th>`;
}

/**
 * Верхний контейнер с элементами управления и строкой поиска
 * @param {*} options 
 * @returns 
 */
function headerTable(options) {
    let div = document.createElement('div');
    let header = `<div class="row">
    <div class="col-6">
    <input class="form-control" type="search" placeholder="Найти" oninput="searchBtable(this)">
    </div>
    </div>`;
    div.innerHTML = header;
    return div;
}

/**
 * Нижний контейнер с элементами управления
 * @param {*} options 
 * @returns 
 */
function footerTable(options) {
    let div = document.createElement('div');
    let noDataMsg = `<div class="text-center p-2 text-muted" id="btabNoData" hidden>Нет данных для отображения</div>`;
    div.innerHTML += noDataMsg;
    return div;
}

/**
 * Действия при скроле страницы
 */
function tableScroll() {
    //endBtable = document.getElementById('endBtable');
    if (endBtable !== null) {
        const windowHeight = window.innerHeight;

        const boundingRect = endBtable.getBoundingClientRect();
        const yPosition = boundingRect.top - windowHeight;
        //console.log(yPosition);
        //Если еще не достигнут конец ленивой загрузки
        if (yPosition < 500) {
            if (pageCurrent < pagesTotal) {
                pageCurrent++;
                for (let i = pageCurrent * rowsToPage; i < rowsToPage * (pageCurrent + 1); i++) {
                    insertRow(data[i]);
                }
            }
        }
    }
}

/**
 * Поиск по данным и вывод результата
 * @param {*} input 
 */
function searchBtable(input) {
    console.log(input.value);
    let btabNoData = document.getElementById('btabNoData');
    btabNoData.hidden = true;
    let sText = input.value;
    pageCurrent = 0; //сбрасываем текущую страницу ленивой загрузки
    let findItems = 0;
    if (input.value.length > 0) {
        itsSearchProcess = true;
        clearTable(); //очистка таблицы перед поиском
        for (let i = 0; i < data.length; i++) {
            for (let key in data[i]) {
                //console.log(data[i][key]);
                if (data[i][key].toString().indexOf(sText) > -1) {
                    insertRow(data[i]);
                    findItems++;
                    break;
                }
            }
        }
        console.log('Find items: ' + findItems);
        if (findItems == 0) {
            btabNoData.hidden = false;
        }
    } else {
        //Если поле для поиска пустое
        itsSearchProcess = false;
        findItems = 0;
        clearTable(); //очистка таблицы перед поиском
        addFirstRows();
    }
}

/**
 * Удаляет все строки с тела таблицы
 */
function clearTable() {
    let count = table.rows.length;
    for (let i = count - 1; i > 0; i--) {
        table.deleteRow(i);
    }
}