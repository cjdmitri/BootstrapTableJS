
//Настройки по умолчанию.
//Применяются, если не были указаны настройки
let optionsDefault = {
    itemsToPage: 50,
    hiddenColumns: ["phone"],
    renameColumn: [
        {
            key: "id",
            replace: "ИД"
        },
        {
            key: "verify",
            replace: "Проверен"
        }
    ],
    replace: [
        {
            value: "true",
            key: "verify",
            replace: `<span class="badge text-bg-success">да</span>`
        },
        {
            value: "false",
            key: "verify",
            replace: `<span class="badge text-bg-warning">нет</span>`
        }
    ]
};

class BsTable {
    //Settings
    options; //Основные настройки приложения переданные при создании таблицы в конструктор

    //Elements
    container; //Контейнер для всех элементов управления и таблицы
    table; //Таблица данных
    tbody; //Тело таблицы данных
    endBtable; //Элемент для определения конца таблицы и необходимости отображения новых данных
    noDataMsg; //Сообщение об отсутствии данных для отображения

    //Данные
    data; //Массив объектов данных полученных при создании таблицы в конструктор
    dataCount;
    pagesTotal = 0; //Количество страниц для загрузки при скроле страницы
    pageCurrent = 0; //текущая страница
    rowsToPage = 50; //Количество элементов на страницу, переопределяется через options
    searchResultData = []; //Массив с результатами посика

    //Состояние
    itsSearchProcess = false; //В данный момент идет процесс поиска



    constructor(idTable, datat, options = optionsDefault) {
        try {
            this.table = document.getElementById(idTable);
            this.data = datat;
            this.options = options;
            this.calculatePages();
            let pnode = this.table.parentNode; //Контейнер, в который была помещена таблица

            //Создаём новый контейнер для элементов и таблицы
            this.container = document.createElement('div');

            //Оборачиваем таблицу в контейнер
            let contTable = document.createElement('div');
            contTable.style.overflowX = 'auto';
            contTable.classList.add('mt-3');
            contTable.append(this.table);

            //Создаём элемент для отслеживания окончания таблицы при пролистывании
            this.endBtable = document.createElement('span');
            this.endBtable.id = 'endBtable';

            contTable.append(this.table);
            contTable.append(this.endBtable);

            this.container.append(this.createHeaderTable());
            this.container.append(contTable);
            this.container.append(this.craeteFooterTable());
            pnode.append(this.container);

            this.createTHeadRow();
            this.createTBoby();
            this.addFirstRows();

            window.addEventListener('scroll', event => {
                this.tableScroll();
            }, false);

            console.log("BsTable created!");
        } catch (error) {
            alert(`При инициализации произошла ошибка: ${error}`)
        }
    }



    /**
     * Отображение начальных строк в таблице, при инициализации и после очистки поля для поиска
     */
    addFirstRows() {
        this.clearTable();
        if (this.dataCount > this.rowsToPage) {
            for (let i = 0; i < this.rowsToPage; i++) {
                this.insertRow(this.data[i]);
            }
        } else {
            for (let i = 0; i < this.data.length; i++) {
                this.insertRow(data[i]);
            }
        }
    }


    /**
     * Добавляет строку в таблицу
     * @param {*} dataItem - объект массива data
     */
    insertRow(dataItem) {
        //console.log('Insert Row');
        let row = this.tbody.insertRow();
        for (let key in dataItem) {
            //Проверяем, следует ли исключить определённые поля
            if (this.options.hiddenColumns != undefined) {
                if (this.options.hiddenColumns.indexOf(key.toString()) > -1) {
                    continue;
                }
            }
            let newCell = row.insertCell();
            newCell.innerHTML = `${this.replaceData(dataItem[key], key)}`
        }

        row.addEventListener('click', event => {
            console.log('Row click');
        }, false)
    }

    /**
     * Получаем количество страниц ленивой загрузки
     */
    calculatePages() {
        if (this.options.itemsToPage != undefined) {
            this.rowsToPage = parseInt(this.options.itemsToPage);
        }
        this.dataCount = this.data.length;
        this.pagesTotal = this.dataCount / this.rowsToPage;
        if (this.dataCount % this.rowsToPage > 0) {
            this.pagesTotal++;
        }
        console.log('Total pages: ' + this.pagesTotal);
        console.log('Items count: ' + this.dataCount);
    }

    /**
     * Замена строки данных строкой из options.replace
     * @param {*} value - данные, которые следует заменить
     * @param {*} key - в каком поле данных следует произвести замену
     * @returns 
     */
    replaceData(value, key) {
        let newValue = value;
        if (this.options.replace != undefined) {
            for (let i = 0; i < this.options.replace.length; i++) {
                if (this.options.replace[i].value.indexOf(value) > -1 && this.options.replace[i].key.indexOf(key) > -1) {
                    newValue = this.options.replace[i].replace;
                }
            }
        }
        return newValue;
    }




    /**
     * Создание строки заголовка таблицы
     */
    createTHeadRow() {
        //let thead = this.table.querySelector('thead');
        //if (thead === null) {
        this.thead = this.table.createTHead();
        let row = this.thead.insertRow();

        for (let key in this.data[0]) {
            //Проверяем, следует ли исключить определённые поля
            if (this.options.hiddenColumns != undefined) {
                if (this.options.hiddenColumns.indexOf(key.toString()) > -1) {
                    continue;
                }
            }
            if (this.options.renameColumn != undefined) {
                let matched = false;
                for (let i = 0; i < this.options.renameColumn.length; i++) {
                    if (this.options.renameColumn[i].key.indexOf(key) > -1) {
                        let newValue = this.options.renameColumn[i].replace;
                        row.appendChild(this.addHeaderTableCell(key, newValue));
                        //newValue = this.options.renameColumn[i].replace;
                        matched = true;
                        break;
                    }
                }
                if (!matched) {
                    row.appendChild(this.addHeaderTableCell(key, key));
                }
            } else {
                row.appendChild(this.addHeaderTableCell(key, key));
            }
        }
        //}
    }

    createTBoby() {
        this.tbody = this.table.querySelector('tbody');
        //console.log(tbody);
        if (this.tbody === null || this.tbody === undefined) {
            this.tbody = document.createElement('tbody');
            this.table.appendChild(this.tbody);
        }
    }

    /**
     * Создаёт ячейку для заголовка таблицы
     * @param {*} key 
     * @param {*} title 
     * @returns 
     */
    addHeaderTableCell(key, title) {
        let cell = document.createElement('th');
        let spanCont = document.createElement('span');
        spanCont.classList.add('d-flex', 'justify-content-between', 'align-items-center');

        let spanTitle = document.createElement('span');
        spanTitle.classList.add('me-2');
        spanTitle.innerHTML = `${title}`;

        let btnSort = document.createElement('button');
        btnSort.classList.add('btn', 'btn-outline-primary', 'border-0');
        btnSort.addEventListener('click', event => {
            this.sortData(`${key}`);
            console.log(`Sort by: ${key}`);
        }, false);
        btnSort.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-down-up" viewBox="0 0 16 16">
        <path fill-rule="evenodd" d="M11.5 15a.5.5 0 0 0 .5-.5V2.707l3.146 3.147a.5.5 0 0 0 .708-.708l-4-4a.5.5 0 0 0-.708 0l-4 4a.5.5 0 1 0 .708.708L11 2.707V14.5a.5.5 0 0 0 .5.5zm-7-14a.5.5 0 0 1 .5.5v11.793l3.146-3.147a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 0 1 .708-.708L4 13.293V1.5a.5.5 0 0 1 .5-.5z"/>
        </svg>`;

        spanCont.appendChild(spanTitle);
        spanCont.appendChild(btnSort);
        cell.appendChild(spanCont);

        return cell;
    }

    /**
     * Верхний контейнер с элементами управления и строкой поиска
     * @returns 
     */
    createHeaderTable() {
        let div = document.createElement('div');
        div.classList.add('row');

        let leftHeader = document.createElement('div');
        leftHeader.classList.add('col-6');

        let sInput = document.createElement('input');
        sInput.classList.add('form-control');
        sInput.setAttribute('type', 'search');
        sInput.setAttribute('placeholder', 'Найти');
        sInput.setAttribute('id', 'searchBTableInput');
        sInput.addEventListener('input', event => {
            this.searchBtable();
        }, false);

        leftHeader.appendChild(sInput);
        div.appendChild(leftHeader);

        return div;
    }

    /**
     * Нижний контейнер с элементами управления
     * @returns 
     */
    craeteFooterTable() {
        let div = document.createElement('div');
        this.noDataMsg = document.createElement('div');
        this.noDataMsg.classList.add('text-center', 'p-2', 'text-muted');
        this.noDataMsg.hidden = true;
        this.noDataMsg.innerHTML = 'Нет данных для отображения';
        div.appendChild(this.noDataMsg);
        return div;
    }

    /**
     * Действия при скроле страницы
     */
    tableScroll() {
        //console.log('Scroll...');
        //endBtable = document.getElementById('endBtable');
        //Если в данный момент не происходит поиска записей
        if (this.endBtable !== null && !this.itsSearchProcess) {
            const windowHeight = window.innerHeight;

            const boundingRect = this.endBtable.getBoundingClientRect();
            const yPosition = boundingRect.top - windowHeight;
            //console.log(yPosition);

            if (yPosition < 500) {
                if (this.pageCurrent < this.pagesTotal) {
                    this.pageCurrent++;
                    for (let i = this.pageCurrent * this.rowsToPage; i < this.rowsToPage * (this.pageCurrent + 1); i++) {
                        this.insertRow(this.data[i]);
                    }
                }
            }
        }
    }

    /**
     * Поиск по данным и вывод результата
     */
    searchBtable() {
        let searchBTableInput = document.getElementById('searchBTableInput');
        console.log(searchBTableInput.value);
        this.noDataMsg.hidden = true;
        let sText = searchBTableInput.value;
        this.pageCurrent = 0; //сбрасываем текущую страницу ленивой загрузки
        //let findItems = 0;
        if (searchBTableInput.value.length > 0) {
            this.itsSearchProcess = true;
            this.clearTable(); //очистка таблицы перед поиском
            this.searchResultData = [];
            for (let i = 0; i < this.data.length; i++) {
                for (let key in this.data[i]) {
                    //Проверяем, следует ли исключить определённые поля
                    if (this.options.hiddenColumns != undefined) {
                        if (this.options.hiddenColumns.indexOf(key.toString()) > -1) {
                            continue;
                        }
                    }
                    //console.log(data[i][key]);
                    if (this.data[i][key].toString().indexOf(sText) > -1) {
                        this.insertRow(this.data[i]);
                        //this.findItems++;
                        this.searchResultData.push(this.data[i])
                        break;
                    }
                }
            }
            console.log('Find items: ' + this.searchResultData.length);
            if (this.searchResultData.length == 0) {
                this.noDataMsg.hidden = false;
            }
        } else {
            //Если поле для поиска пустое
            this.itsSearchProcess = false;
            //findItems = 0;
            this.searchResultData = [];
            //clearTable(); //очистка таблицы перед поиском
            this.addFirstRows();
        }
    }

    itsSortReverse = false; //Отслеживает изменение порядка сортировки
    /**
     * Сортировка данных по названию ключа
     * @param {*} keyName - название ключа
     */
    sortData(keyName) {
        let sortDataArray = [];
        //Если производится поиск записей и есть результаты поиска, то сортируем только их
        if (this.searchResultData.length > 0 && this.itsSearchProcess) {
            sortDataArray = this.searchResultData;
        } else {
            sortDataArray = this.data;
        }

        sortDataArray.sort((a, b) => {
            const nameA = a[keyName];
            const nameB = b[keyName];
            if (nameA < nameB) {
                return -1;
            }
            if (nameA > nameB) {
                return 1;
            }
            return 0;
        });
        if (this.itsSortReverse) {
            sortDataArray = sortDataArray.reverse();
        }
        this.itsSortReverse = !this.itsSortReverse;

        //Если происходит сортировка результатов поиска, то отображаем все результаты поиска
        //Иначе отображаем только необходимое количество записей, остальное показываем при пролистывании
        if (this.searchResultData.length > 0 && this.itsSearchProcess) {
            this.clearTable();
            this.searchResultData = sortDataArray;
            for (let i = 0; i < this.searchResultData.length; i++) {
                this.insertRow(this.searchResultData[i]);
            }
        } else {
            this.addFirstRows();
        }
    }

    /**
     * Удаляет все строки с тела таблицы
     */
    clearTable() {
        let count = this.table.rows.length;
        for (let i = count - 1; i > 0; i--) {
            this.table.deleteRow(i);
        }
    }

}

