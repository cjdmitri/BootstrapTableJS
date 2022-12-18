let table; //Таблица данных
let endBtable; //Элемент окончания таблицы
let data; //Данные JSON



function initBtable(idTable, datat, options) {
    table = document.getElementById(idTable);
    data = datat;
    let pnode = table.parentNode; //Контейнер, в который была помещена таблица

    //Создаём новый контейнер для элементов и таблицы
    let container = document.createElement('div');

    //Оборачиваем таблицу в контейнер
    let contTable = document.createElement('div');
    contTable.style.overflowX = 'auto';
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
    for (let i = 0; i < data.length; i++) {
        let row = table.insertRow();
        for (let key in data[i]) {
            row.innerHTML += `<td>${data[i][key]}</td>`;
        }
    }


}

window.addEventListener('scroll', tableScroll);

function createHead(options) {
    let thead = table.querySelector('thead');
    if (thead === null) {
        if (options.head != undefined) {
            thead = table.createTHead();
            let row = thead.insertRow();
            for(let i=0; i<options.head.length; i++){
                row.innerHTML +=`<th>${options.head[i]}</th>`;
            }
        }
    }
}

function headerTable(options) {
    let div = document.createElement('div');
    let header = '<h4>Header</h4>';
    div.innerHTML = header;
    return div;
}


function footerTable(options) {
    let div = document.createElement('div');
    let footer = '<h4>footer</h4>';
    div.innerHTML = footer;
    return div;
}

function tableScroll() {
    endBtable = document.getElementById('endBtable');
    if (endBtable !== null) {
        const windowHeight = window.innerHeight;

        const boundingRect = endBtable.getBoundingClientRect();
        const yPosition = boundingRect.top - windowHeight;
        console.log(yPosition);
    }

}