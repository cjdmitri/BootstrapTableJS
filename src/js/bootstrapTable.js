/*!
 * Bootstrap Table JS
 * Version: 0.1.0
 * Release: 02.2023
 */
class BsTable {
    //Settings
    //Основные настройки приложения переданные при создании таблицы в конструктор
    options = {
        itemsToPage: 50,
        //hiddenColumns: ["phone"], 
        tableHeight: "500px",
        fixedHeaderTable: true,
        //showFooter: true
    };

    //Elements
    container; //Контейнер для всех элементов управления и таблицы
    table; //Таблица данных
    tbody; //Тело таблицы данных
    endBtable; //Элемент для определения конца таблицы и необходимости отображения новых данных
    noDataMsg; //Сообщение об отсутствии данных для отображения
    contTable; //Контейнер для таблицы
    footer;

    #actionRow; //Строка действий для строки данных таблицы

    //Данные
    data; //Массив объектов данных полученных при создании таблицы в конструктор
    pagesTotal = 0; //Количество страниц для загрузки при скроле страницы
    pageCurrent = 0; //текущая страница
    rowsToPage = 50; //Количество элементов на страницу, переопределяется через options

    searchResultData = []; //Массив с результатами посика

    //Состояние
    itsSearchProcess = false; //В данный момент идет процесс поиска
    needScroll = false;




    /**
     * 
     * @param {string} idTable - идентификатор таблицы
     * @param {Array} datat - массив данных таблицы
     * @param {object} _options - настройки таблицы (не обязательный параметр)
     */
    constructor(idTable, datat, _options = null) {
        //try {
        this.table = document.getElementById(idTable);
        this.data = datat;
        if (_options != null) {
            this.options = _options;
        }
        this.#calculatePages();
        let pnode = this.table.parentNode; //Контейнер, в который была помещена таблица

        //Создаём новый контейнер для элементов и таблицы
        this.container = document.createElement('div');
        this.container.classList.add('position-relative');

        //Оборачиваем таблицу в контейнер
        this.contTable = document.createElement('div');
        this.contTable.style.overflowX = 'auto';
        this.contTable.classList.add('mt-3', 'position-relative');
        if (this.options.tableHeight != undefined) {
            this.contTable.style.height = this.options.tableHeight.toString();
        }
        this.contTable.append(this.table);

        //Создаём элемент для отслеживания окончания таблицы при пролистывании
        this.endBtable = document.createElement('div');
        this.endBtable.id = 'endBtable';

        this.contTable.append(this.table);
        this.contTable.append(this.endBtable);


        this.contTable.append(this.#createNoDataMessage());

        this.container.append(this.#createHeaderTable());
        this.container.append(this.contTable);

        //if (this.options.showFooter === true) {
        this.container.append(this.#createFooter());
        //}

        pnode.append(this.container);

        this.#createTHeadRow();
        this.#createTBoby();
        this.#addFirstRows();
        this.#watchNeedAppend();
        if (this.options.actions != undefined) {
            //this.#actionRowCreate();
            this.#actionRow = new ActionsRow(this.contTable, this.options);
        }
        //this.settingsModal = new SettingsModal(this.container, this.options);

        console.log("BsTable created!");
        //} catch (error) {
        //alert(`При инициализации произошла ошибка: ${error}`)
        //}
    }





    #createNoDataMessage() {
        this.noDataMsg = document.createElement('div');
        this.noDataMsg.classList.add('text-center', 'p-2', 'text-muted');
        this.noDataMsg.hidden = true;
        this.noDataMsg.innerHTML = 'Нет данных для отображения';
        return this.noDataMsg;
    }

    //#region Public

    /**
   * Для активного элемента данных создаём get, set. Для отсеживания изменений
   */
    #activeItemData;

    get activeItemData() {
        return this.#activeItemData;
    }

    set activeItemData(value) {
        this.#activeItemData = value;
    }


    /**
    * Добавляет строку в таблицу
    * @param {object} dataItem - объект массива data
    */
    insertRow(dataItem) {
        let row = this.tbody.insertRow();
        for (let key in dataItem) {
            //Проверяем, следует ли исключить определённые поля
            if (this.options.hiddenColumns != undefined) {
                if (this.options.hiddenColumns.indexOf(key.toString()) > -1) {
                    continue;
                }
            }
            let newCell = row.insertCell();
            newCell.innerHTML = `${this.#replaceData(dataItem[key], dataItem, key)}`
        }
        row.addEventListener('click', event => { this.#rowClicked(dataItem, row) }, false)
        row.addEventListener('mouseenter', event => { this.#rowMouseenter(dataItem, row) }, false)
        row.addEventListener('mouseleave', event => { this.#rowMouseleave(dataItem, row) }, false)
    }


    /**
    * Удаляет активную строку из таблицы и объект из массива
    */
    removeActiveItem() {
        try {
            let removeItem = this.activeItemData;
            let index = this.data.indexOf(this.activeItemData);
            let rItem = this.data.splice(index, 1);
            this.#activeItemRow.remove();

            //Обновляем ихформацию об активных элементах
            this.activeItemData = null;
            this.#activeItemRow = null;
            this.#actionRow.hide();
            //console.log('Item deleted');
            //console.log('Items count: ' + this.data.length);

            
            console.log(removeItem);
            return removeItem;
        } catch (error) {
            console.error(error);
            return null;
        }
    }

    /**
     * Поиск по данным и вывод результата
     * @param {*} sText - текст для поиска совпадений
     */
    search(sText) {
        if(this.#actionRow !== undefined){
            this.#actionRow.hide();
        }
        //let searchBTableInput = document.getElementById('searchBTableInput');
        console.log(searchBTableInput.value);
        this.noDataMsg.hidden = true;
        //let sText = searchBTableInput.value;
        this.pageCurrent = 0; //сбрасываем текущую страницу ленивой загрузки
        //let findItems = 0;
        if (sText.length > 0) {
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
            this.#addFirstRows();
        }
    }

    #itsSortReverse = false; //Отслеживает изменение порядка сортировки
    /**
     * Сортировка данных по названию ключа
     * @param {*} keyName - название ключа
     */
    sortData(keyName) {
        let sortDataArray = [];
        if(this.#actionRow !== undefined){
            this.#actionRow.hide();
        }
        this.contTable.scrollTop = 0;
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
        if (this.#itsSortReverse) {
            sortDataArray = sortDataArray.reverse();
        }
        this.#itsSortReverse = !this.#itsSortReverse;

        //Если происходит сортировка результатов поиска, то отображаем все результаты поиска
        //Иначе отображаем только необходимое количество записей, остальное показываем при пролистывании
        if (this.searchResultData.length > 0 && this.itsSearchProcess) {
            this.clearTable();
            this.searchResultData = sortDataArray;
            for (let i = 0; i < this.searchResultData.length; i++) {
                this.insertRow(this.searchResultData[i]);
            }
        } else {
            this.#addFirstRows();
        }
    }

    /**
     * Удаляет все строки с тела таблицы, но не удаляет объекты из массива data
     */
    clearTable() {
        let count = this.table.rows.length;
        for (let i = count - 1; i > 0; i--) {
            this.table.deleteRow(i);
        }
    }

    //#endregion

    /**
     * Отслеживает позицию конца таблицы и при необходимости подгружает данные
     */
    #watchNeedAppend() {
        setInterval(() => {
            if (!this.itsSearchProcess && this.data.length > this.rowsToPage) {
                if (this.pageCurrent < this.pagesTotal && this.#needMoreLoadData()) {
                    //console.log("watchNeedAppend");
                    this.#tableScroll();
                }
            }
        }, 500);
    }

    /**
     * Активная строка таблицы
     */
    #activeItemRow;

    /**
     * Отображение начальных строк в таблице, при инициализации и после очистки поля для поиска
     */
    #addFirstRows() {
        this.clearTable();
        if (this.data.length === 0) {
            this.noDataMsg.hidden = false;
        } else {
            this.noDataMsg.hidden = true;
        }
        if (this.data.length > this.rowsToPage) {
            for (let i = 0; i < this.rowsToPage; i++) {
                this.insertRow(this.data[i]);
            }
        } else {
            for (let i = 0; i < this.data.length; i++) {
                this.insertRow(this.data[i]);
            }
        }
    }

    /**
     * Действия при клике по строке таблицы
     * @param {object} dataItem - объект массива data
     * @param {object} row - строка таблицы
     */
    #rowClicked(dataItem, row) {
        this.activeItemData = dataItem;
        this.#activeItemRow = row;
        if (this.options.actions != undefined) {
            this.#actionRow.show(dataItem, row);

        }
    }

    #rowMouseenter(dataItem, row) { }

    #rowMouseleave(dataItem, row) { }

    /**
     * Получаем количество страниц ленивой загрузки
     */
    #calculatePages() {
        if (this.options.itemsToPage != undefined) {
            this.rowsToPage = parseInt(this.options.itemsToPage);
        }
        this.data.length = this.data.length;
        this.pagesTotal = Math.round(this.data.length / this.rowsToPage);
        let p = this.data.length % this.rowsToPage;
        if (p > 0) {
            this.pagesTotal++;
        }
        console.log('Total pages: ' + this.pagesTotal);
        console.log('Items count: ' + this.data.length);
    }

    /**
     * Замена строки данных строкой из options.replace
     * @param {*} value - данные, которые следует заменить
     * @param {*} dataItem - объект, данные которого следует заменит
     * @param {*} key - в каком поле данных следует произвести замену
     * @returns 
     */
    #replaceData(value, dataItem, key) {
        let newValue = value;
        if (this.options.replace != undefined) {
            for (let i = 0; i < this.options.replace.length; i++) {
                //Если необходимо заменить любое значение свойства
                if (this.options.replace[i].value === '{value}') {
                    //for(let k in dataItem){
                    if (key === this.options.replace[i].key) {
                        //console.log("{value} find. value: " + dataItem[key]);
                        let value = dataItem[key];
                        newValue = this.options.replace[i].replace.replaceAll('{value}', value);
                        //console.log(newValue);
                    }
                    //}

                } else if (this.options.replace[i].value.indexOf(value) > -1 && this.options.replace[i].key.indexOf(key) > -1) {
                    //Если необходимо заменить только точное совпадение с указанным
                    newValue = this.options.replace[i].replace;
                }
            }
        }
        return newValue;
    }

    /**
     * Создание строки заголовка таблицы
     */
    #createTHeadRow() {
        //let thead = this.table.querySelector('thead');
        //if (thead === null) {
        this.thead = this.table.createTHead();
        if (this.options.fixedHeaderTable === true) {
            this.thead.classList.add("sticky-top", "bg-white", "shadow");
        } else {
            this.thead.classList.add("bg-white", "shadow");
        }

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
                        row.appendChild(this.#addHeaderTableCell(key, newValue));
                        //newValue = this.options.renameColumn[i].replace;
                        matched = true;
                        break;
                    }
                }
                if (!matched) {
                    row.appendChild(this.#addHeaderTableCell(key, key));
                }
            } else {
                row.appendChild(this.#addHeaderTableCell(key, key));
            }
        }
        //}
    }

    /**
     * Создаёт тело таблицы (tbody) при его отсутствии
     */
    #createTBoby() {
        this.tbody = this.table.querySelector('tbody');
        //console.log(tbody);
        if (this.tbody === null || this.tbody === undefined) {
            this.tbody = document.createElement('tbody');
            //this.tbody.addEventListener('change', this.#changeTBody, false);
            // Select the node that will be observed for mutations



            this.table.appendChild(this.tbody);
        }

        // Options for the observer (which mutations to observe)
        const config = { attributes: true, childList: true, subtree: false };
        const observer = new MutationObserver(this.#changeTBodyCallback);
        observer.observe(this.tbody, config);
    }

    /**
     * Отслеживает изменения в таблице данных
     * @param {*} mutationList 
     * @param {*} observer 
     */
    #changeTBodyCallback = (mutationList, observer) => {
        for (const mutation of mutationList) {
            if (mutation.type === 'childList') {
                //console.log('A child node has been added or removed.');
                let curData = this.tbody.querySelectorAll('tr').length;
                this.#footerLabelData.innerHTML = `Записей: <strong>${curData}</strong> из <strong>${this.data.length}</strong>`;
            } else if (mutation.type === 'attributes') {
                //console.log(`The ${mutation.attributeName} attribute was modified.`);
            }
        }
    }

    /**
     * Создаёт ячейку для заголовка таблицы
     * @param {*} key - ключ объекта
     * @param {*} title - отображаемый заголовок
     * @returns - ячейка строки заголовка таблицы <th>
     */
    #addHeaderTableCell(key, title) {
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
    #createHeaderTable() {
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
            this.search(sInput.value);
        }, false);

        leftHeader.appendChild(sInput);
        div.appendChild(leftHeader);

        let rightHeader = document.createElement('div');
        rightHeader.classList.add('col-6', 'd-flex', 'justify-content-end');

        /*         let btnSettings = document.createElement('button');
                btnSettings.classList.add('btn', 'btn-outline-primary', 'border-0');
                btnSettings.setAttribute('data-bs-toggle', 'modal');
                btnSettings.setAttribute('data-bs-target', '#btableSettingsModa');
                btnSettings.innerHTML = '<i class="bi bi-gear"></i>';
        
                let btnGroupSave = document.createElement('div');
                btnGroupSave.classList.add('btn-group');
                btnGroupSave.setAttribute('role', 'group');
        
                let btnSaveToggle = document.createElement('button');
                btnSaveToggle.classList.add('btn', 'btn-outline-primary', 'border-0', 'dropdown-toggle');
                btnSaveToggle.setAttribute('data-bs-toggle', 'dropdown');
                btnSaveToggle.setAttribute('aria-expanded', 'false');
                btnSaveToggle.innerHTML = '<i class="bi bi-download"></i>';
        
                
                let btnSaveList = document.createElement('ul');
                btnSaveList.classList.add('dropdown-menu');
        
                btnSaveList.innerHTML+=`<li><a class="dropdown-item" href="#">Dropdown link</a></li>
                <li><a class="dropdown-item" href="#">Dropdown link</a></li>`;
                
                btnGroupSave.append(btnSaveToggle);
                btnGroupSave.append(btnSaveList);
        
        
                rightHeader.append(btnSettings);
                rightHeader.append(btnGroupSave); */
        //rightHeader.innerHTML+='<button class="btn btn-outline-primary border-0" type="button" data-bs-toggle="offcanvas" data-bs-target="#bstablesettingspanel"><i class="bi bi-gear"></i></button>';

        //let sModal

        div.appendChild(rightHeader);

        return div;
    }

    /**
     * Нижний контейнер с элементами управления
     * @returns 
     */
    #craeteFooterTable() {
        let div = document.createElement('div');

        return div;
    }

    /**
     * Если окончание таблицы в поле видимости экрана, то true
     * @returns 
     */
    #needMoreLoadData() {
        const windowHeight = window.innerHeight;
        const boundingRect = this.endBtable.getBoundingClientRect();
        const yPosition = boundingRect.top - windowHeight;
        if (yPosition < 500) {
            return true;
        }
        return false;
    }

    /**
     * Действия при скроле страницы
     */
    #tableScroll() {
        //Если в данный момент не происходит поиска записей
        if (!this.itsSearchProcess && this.#needMoreLoadData()) {
            if (this.pageCurrent < this.pagesTotal) {
                this.pageCurrent++;
                for (let i = this.pageCurrent * this.rowsToPage; i < this.rowsToPage * (this.pageCurrent + 1); i++) {
                    this.insertRow(this.data[i]);
                }
            }
        }
    }


    #footer //Контейнер для элементов управления футера
    #footerLabelData; //Количество показанных записей
    #createFooter() {
        this.#footer = document.createElement('div');
        this.#footer.classList.add('mt-3', 'row');

        let leftColFooter = document.createElement('div');
        leftColFooter.classList.add('col-6');

        let rightColFooter = document.createElement('div');
        rightColFooter.classList.add('col-6');

        this.#footerLabelData = document.createElement('label');
        leftColFooter.append(this.#footerLabelData);



        this.#footer.append(leftColFooter);
        this.#footer.append(rightColFooter);

        return this.#footer;
    }


}

/**
 * Строка действий и дополнительной информации для текущей записи таблицы
 */
class ActionsRow {

    #actionRow;
    #actionRowButtonsGroup;
    #options;

    constructor(container, options) {
        this.#options = options;
        this.#actionRow = document.createElement('div');
        this.#actionRow.classList.add('position-absolute', 'bg-white', 'shadow', 'p-2', 'd-flex', 'justify-content-between', 'align-items-center', 'd-none');
        //this.#actionRow.style.width = "100%";
        this.#actionRow.style.zIndex = "1000";
        this.#actionRow.style.left = "0px";
        this.#actionRow.style.top = "0px";
        this.#actionRow.style.border = "1px solid #c7c7ff";
        this.#actionRow.style.borderRadius = "5px";

        this.#actionRow.style.transition = "all 0.2s ease 0s";
        this.#actionRow.hidden = true;

        //Actions
        this.#actionRowButtonsGroup = document.createElement('div');
        this.#actionRowButtonsGroup.classList.add('btn-group', 'me-5');
        //btnGroup.innerHTML = '<button type="button" class="btn btn-sm btn-primary">Primary</button>';
        this.#actionRow.append(this.#actionRowButtonsGroup);

        //hidden button
        let hiddenBtn = document.createElement('button');
        hiddenBtn.type = 'button';
        hiddenBtn.classList.add('btn-close');
        this.#actionRow.append(hiddenBtn);
        hiddenBtn.addEventListener('click', event => {
            this.hide();
        }, false);

        container.append(this.#actionRow);
    }

    /**
     * Показать строку
     * @param {object} dataItem - объект данных
     * @param {object} row - для какой строки показать
     */
    show(dataItem, row) {
        if (this.#options.actions != undefined) {
            this.#actionRow.hidden = false;
            this.#actionRow.style.top = row.offsetTop + 'px';
            this.#actionRow.classList.remove('d-none');

            this.#actionRowButtonsGroup.innerHTML = null;
            if (this.#options.actions != undefined) {
                for (let i = 0; i < this.#options.actions.length; i++) {
                    let actionItem = this.#options.actions[i];
                    for (let key in dataItem) {
                        let keyRepl = `{${key}}`;
                        actionItem = actionItem.replaceAll(keyRepl, dataItem[key]);
                    }
                    this.#actionRowButtonsGroup.innerHTML += actionItem;
                }
            }
        }
    }

    /**
     * Скрывает строку
     */
    hide() {
        if (this.#options.actions != undefined && this.#actionRow != null) {
            this.#actionRow.hidden = true;
            this.#actionRow.classList.add('d-none');
        }
    }
}

/* class SettingsModal {

    modal;

    constructor(container, options) {
        this.modal = document.createElement('div');
        this.modal.id = 'btableSettingsModa';
        this.modal.classList.add('modal', 'fade');
        this.modal.setAttribute('tabindex', '-1');
        this.modal.setAttribute('aria-hidden', 'true');

        this.modal.innerHTML = ` <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h1 class="modal-title fs-5" id="exampleModalLabel">Настройки</h1>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            ...
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            <button type="button" class="btn btn-primary">Save changes</button>
          </div>
        </div>
      </div>`;
        container.append(this.modal);
    }

    remove(){
        this.modal.remove();
    }
} */

