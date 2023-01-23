let dataJ = [];
let b = true;
for (let i = 1; i <= 953; i++) {
    let item = {
        id: i,
        name: 'Name ' + i,
        email: 'mail_' + i + '@mail.com',
        phone: '378172' + i,
        verify: b
    }
    dataJ.push(item);
    b = !b;
}

let options = {
    itemsToPage: 50,
    hiddenColumns: ["phone"],
    tableHeight: "500px",
    fixedHeaderTable: true,
    renameColumn: [
        {
            key: "id",
            replace: "ИД"
        },
        {
            key: "verify",
            replace: "Проверен"
        },
        {
            key: "name",
            replace: "Имя"
        },
        {
            key: "email",
            replace: "Email"
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
        },
        {
            value: "{value}",
            key: "name",
            replace: `<a href="{value}" target="_blank">{value}</a>`
        }
    ],
    actions: [
        `<a class="btn btn-sm btn-primary" href="javascript:edite()"><i class="bi bi-pencil"></i></a>`,
        `<a class="btn btn-sm btn-danger" href="javascript:remove('{name}')"><i class="bi bi-trash3"></i></a>`
    ]
};


const btable = new BsTable('btable', dataJ, options);
function remove(name){
    if(confirm('Удалить запись?')){
        btable.removeActiveItem();
    }
}

function edite(){
    let item = btable.activeItemData;
    console.log(item);
}



//table API
let dataApi = [
    {
        mt:"removeActiveItem()",
        descr:"Удаляет активный объект из таблицы и из массива <code>data</code>",
        ret:"Удалённый объект"
    },
    {
        mt:"tbody",
        descr:"Тело таблицы данных",
        ret:""
    },
    {
        mt:"data",
        descr:"Массив объектов",
        ret:"Массив объектов"
    },
    {
        mt:"searchResultData",
        descr:"Результат последнего поиска. length = 0 если поле для поиска не содержит символов.",
        ret:"Массив объектов"
    },
    {
        mt:"activeItemData()",
        descr:"Активный объект массива data и таблицы данных.",
        ret:"Объект"
    },
    {
        mt:"search(sText)",
        descr:"Выполняет поиск по массиву data и вывод результата в таблицу",
        ret:""
    },
    {
        mt:"sortData(keyName)",
        descr:"Сортировка данных таблицы и массива data по ключу",
        ret:""
    },
    {
        mt:"clearTable()",
        descr:"Очистка таблицы. Массив data не затрагивается",
        ret:""
    }
];

let optionsApi = {
    itemsToPage: 50,
    fixedHeaderTable: true,
    renameColumn: [
        {
            key: "mt",
            replace: "Метод"
        },
        {
            key: "descr",
            replace: "Описание"
        },
        {
            key: "ret",
            replace: "Возвращаемое значение"
        }
    ],
    replace: [
        {
            value: "{value}",
            key: "mt",
            replace: `<code>{value}</code>`
        }
    ]
};

const btableApi = new BsTable('bstableApi', dataApi, optionsApi);
