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

let optionsDefault={
    itemsToPage:50,
    head:['id', 'Name', 'Email', 'Phone']
};



function initBtable(idTable, datat, options = optionsDefault) {
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
    let endBtable = document.createElement('span');
    endBtable.id = 'endBtable';

    contTable.append(table);
    contTable.append(endBtable);

    container.append(headerTable(options));
    container.append(contTable);
    container.append(footerTable(options));
    pnode.append(container);

    createHead(options);
    addFirstRows();
}

window.addEventListener('scroll', tableScroll);


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

function insertRow(dataItem) {
    let row = table.insertRow();
    for (let key in dataItem) {
        row.innerHTML += `<td>${dataItem[key]}</td>`;
    }
}

function createHead(options) {
    let thead = table.querySelector('thead');
    if (thead === null) {
        if (options.head != undefined) {
            thead = table.createTHead();
            let row = thead.insertRow();
            for (let i = 0; i < options.head.length; i++) {
                row.innerHTML += `<th>${options.head[i]}</th>`;
            }
        } else {
            for (let key in data[0]) {
                //если не указан хедер то устанавливаем из названия полей
            }
        }
    }
}

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


function footerTable(options) {
    let div = document.createElement('div');
    let noDataMsg = `<div class="text-center p-2 text-muted" id="btabNoData" hidden>Нет данных для отображения</div>`;
    div.innerHTML += noDataMsg;
    return div;
}

function tableScroll() {
    endBtable = document.getElementById('endBtable');
    if (endBtable !== null) {
        const windowHeight = window.innerHeight;

        const boundingRect = endBtable.getBoundingClientRect();
        const yPosition = boundingRect.top - windowHeight;
        //console.log(yPosition);
        //Если еще не достигнут конец ленивой загрузки
        if (yPosition < 500) {
            if (pageCurrent < pagesTotal) {
                for (let i = pageCurrent * rowsToPage; i < rowsToPage * (pageCurrent + 1); i++) {
                    insertRow(data[i]);
                }
                pageCurrent++;
            }
        }
    }
}

function searchBtable(input) {
    console.log(input.value);
    let btabNoData = document.getElementById('btabNoData');
    btabNoData.hidden=true;
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
        if(findItems==0){
            btabNoData.hidden=false;
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