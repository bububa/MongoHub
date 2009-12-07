function connection_info(name, connections)
{
    for(var i=0; i<connections.size(); i++)
    {
        if (connections[i].name == name)
        {
            return connections[i];
        }
    }
    return null;
}

function showBrowseCollection(connection, dbname, name)
{
    var win = Titanium.UI.getCurrentWindow();
    var win2 = win.createWindow('app://windows/browse_collection.html');
    win2.setHeight(500);
    win2.setWidth(800);
    //win2.setTransparency(0.8);
    win2.setTitle('Browse Collection | ' + connection.name + ' | ' + dbname + ' | ' + name);
    //win2.setMaximizable(false);
    //win2.setResizable(false);
    win2.open();
}

function showDropCollection(connection, dbname, name)
{
    if (confirm('Do you want to drop this collection?'))
    {
        dropCollection(connection.name, dbname, name); 
        updateCollections(connection, dbname);
        return;
    }
}

function updateCollections(connection, dbname)
{
    var collections = mongo.show_collections(connection.host, connection.port, dbname);
    if (collections == -1)
    {
        alert('Failed to connect ' + connection.name);
        return false;
    }else{
        var html = '<ul class="collections">';
        collections.each(function(collection){
            html += '<li class="collection"><div class="name">' + collection + '</div><button class="browse blue">Browse</button><button class="drop red">Drop</button></li>';
        });
        html += '</ul>';
        $('main-innerlist').update(html);
        $$('.collection').each(function(e){
            var cname = e.getElementsByClassName('name')[0].innerHTML;
            e.getElementsByClassName('browse')[0].observe('click', function(){
                showBrowseCollection(connection, dbname, cname);
            });
            e.getElementsByClassName('drop')[0].observe('click', function(){
                showDropCollection(connection, dbname, cname);
            });
        });
        $('menubar').show();
    }
}
function updateConnections()
{
    var connections = loadConnection();
    if (connections && connections.size()>0)
    {
        var html = '<ul class="connections">';
        connections.each(function(c){
            html += '<li class="connection">' + c.name + '</li>';
        });
        html += '</ul>';
    }else{
        $('sidebar').update('');
        return;
    }
    $('sidebar').update(html);
    $$('#sidebar ul.connections')[0].observe('click', function(e){
        var dom = e.findElement('li.db');
        if (dom)
        {
            cons = $$('#sidebar li.connection.selected');
            if (!cons || cons.size() == 0) return;
            var connection = connection_info(cons[0].innerHTML, connections);
            if (!connection)
            {
                alert('Unexpected error!');
                return false;
            }
            dom.addClassName('selected');
            $('database_name').update(dom.innerHTML);
            updateCollections(connection, dom.innerHTML);
            return;
        }
        $$('#sidebar li.connection').each(function(l){l.removeClassName('selected');});
        $$('#sidebar li.dbs').each(function(l){l.remove();});
        var clickedRow;
        clickedRow = e.findElement('li.connection');
        if (clickedRow) {
            clickedRow.addClassName('selected');
            var connection = connection_info(clickedRow.innerHTML, connections);
            if (!connection)
            {
                alert('Unexpected error!');
                return false;
            }
            $('connection_name').update(clickedRow.innerHTML);
            var dbs = mongo.show_dbs(connection.host, connection.port);
            if (dbs == -1)
            {
                alert('Failed to connect ' + connection.name);
                return false;
            }else{
                var html = '<li class="dbs"><ul>';
                dbs.each(function(db){
                    html += '<li class="db">' + db + '</li>';
                });
                html += '</li></ul>';
                clickedRow.insert({after:html});
            }
            $$('#sidebar li.dbs')[0].observe('click', function(e){
                $$('#sidebar li.db').each(function(l){l.removeClassName('selected');});
                var clickedRow2;
                clickedRow2 = e.findElement('li.db');
                if (clickedRow2) {
                    clickedRow2.addClassName('selected');
                    updateCollections(connection, clickedRow2.innerHTML);
                }
            });
        }
    });
}

function showAddConnection()
{
    var win = Titanium.UI.getCurrentWindow();
    var win2 = win.createWindow('app://windows/add_connection.html');
    win2.addEventListener(Titanium.CLOSED, updateConnections);
    win2.setHeight(160);
    win2.setWidth(390);
    win2.setTransparency(0.8);
    win2.setTitle('New Connection');
    win2.setMaximizable(false);
    //win2.setResizable(false);
    win2.open();
}

function showEditConnection()
{
    dom = $$('#sidebar li.connection.selected');
    if (!dom || dom.size()==0)
    {
        alert('Please select a connection you want to edit!');
        return false;
    }
    var win = Titanium.UI.getCurrentWindow();
    var win2 = win.createWindow('app://windows/edit_connection.html');
    win2.addEventListener(Titanium.CLOSED, updateConnections);
    win2.setHeight(160);
    win2.setWidth(390);
    win2.setTransparency(0.8);
    win2.setTitle('Edit Connection | ' + dom[0].innerHTML);
    win2.setMaximizable(false);
    //win2.setResizable(false);
    win2.open();
}

function showRemoveConnection()
{
    dom = $$('#sidebar li.connection.selected');
    if (!dom || dom.size()==0)
    {
        alert('Please select a connection you want to remove!');
        return false;
    }
    if (confirm('Do you want to delete this connection?'))
    {
        removeConnection(dom[0].innerHTML.strip());
        updateConnections();
        return;
    }
}

function showDropDB()
{
    if ($('connection_name').innerHTML==''|| $('database_name').innerHTML=='')
    {
        alert('Please select a database you want to remove!');
        return false;
    }
    if (confirm('Do you want to drop this database?'))
    {
        dropDB($('connection_name').innerHTML.strip(), $('database_name').innerHTML.strip());
        updateConnections();
        return;
    }
}

function showQuery(query)
{
    if ($('connection_name').innerHTML==''|| $('database_name').innerHTML=='')
    {
        alert('Please select a database you want to query!');
        return false;
    }
    var win = Titanium.UI.getCurrentWindow();
    var win2 = win.createWindow('app://windows/query.html');
    //win2.addEventListener(Titanium.CLOSED, function(){updateConnections();updateCollections();});
    win2.setHeight(500);
    win2.setWidth(600);
    win2.setTitle('Query | ' + $('connection_name').innerHTML + ' | ' + $('database_name').innerHTML + ' | ' + query);
    //win2.setMaximizable(false);
    //win2.setResizable(false);
    win2.open();
}

function createMenu()
{
    var menu = Titanium.UI.createMenu();
    var connection = Titanium.UI.createMenuItem("Connection");
    connection.addItem("New Connection", function() {
                        showAddConnection();
                    });
    connection.addItem("Remove Connection", function() {
                        showRemoveConnection();
                    });
    connection.addItem("Edit Connection",  function(){
                        showEditConnection();
                    });
    menu.appendItem(connection);
    var database = Titanium.UI.createMenuItem("Database");
    database.addItem("New Database", function() {
                        showAddConnection();
                    });
    database.addItem("Drop Database", function() {
                        showDropDB();
                    });
    menu.appendItem(database);
    Titanium.UI.setMenu(menu);
}

function createDb()
{
    updateConnections();
}

function navigatorClickHandler(elm)
{
    if (elm.title == 'Connection')
    {
        showAddConnection();
    }else if (elm.title == 'Query') {
        showInputQuery();
    }
}

function menubarClickHandler(elm)
{
    if (elm.title=="Create Database")
    {
        createDb();
    }
}
function navigatorInit()
{
    /*$$('.NavigationBar a.Item').each (
        function(e) 
        {
            e.observe('click', function(){navigatorClickHandler(e);});
        }
    );
    $$('#menubar a').each (
        function(e) 
        {
            e.observe('click', function(){menubarClickHandler(e);});
        }
    );*/
    $('runquerybtn').observe('click', function(){
        showQuery($F('query'));
    });
    updateConnections();
}

function updater()
{
    Titanium.UpdateManager.onupdate = function(details) {
        if (confirm('A new version: ' + details.version + ' is available. Would you like to install it?')) {
            // this function installs the new updated version of my app
            Titanium.UpdateManager.installAppUpdate(details, function() { 
                alert('The new version has been installed'); 
            }); 
        }
    };
}