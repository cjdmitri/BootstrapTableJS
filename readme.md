<h1>Bootstrap Table JS</h1>
<a href="https://cjdmitri.github.io/BootstrapTableJS/">Смотреть пример на github.io</a>
<h4>Базовые возможности:</h4>
<ul>
    <li>Автоматическое построение таблицы на основе массива объектов;</li>
    <li>Возможность переименовывать названия полей;</li>
    <li>Фильтрация данных;</li>
    <li>Сортировка данных;</li>
    <li>Закрепление строки заголовков;</li>
    <li>Возможность замены строк данных по шаблону, указанному в настройках;</li>
    <li>Гибкая настрйка действий с элементами данных</li>
</ul>
<h4>Быстрый старт</h4>
<p>Создайте таблицу в файле <code>.html</code> и пропишите идентификатор <code><table class="table" id="btable"></table></code></p>
<p>Подключите скрипт: <code><script src="js/bootstrapTable.js"></script></code></p>
<p>Создайте таблицу данных в файле <code>.js</code><code>const btable = new BsTable('btable', data, options);</code></p>
<ul>
<li><code>'btable'</code> - Id таблицы</li>
<li><code>data</code> - массив объектов</li>
<li><code>options</code> - настройки таблицы (не обязательный параметр)</li>
</ul>