function addConnection(name, host, port)
{
    name = name.strip();
    host = host.strip();
    port = port.strip();
    if (name.empty())
    {
        $('err').update("* Please input a name for this connection.");
        return false;
    }else if (host.empty()) {
        $('err').update("* Please input the host address.");
        return false;
    }else if (port.empty()) {
        $('err').update("* Please input the port.");
        return false;
    }
    var db = Titanium.Database.open('mongohub');
    db.execute("CREATE TABLE IF NOT EXISTS connections (name TEXT, host TEXT, port INT)");
    var rows = db.execute("SELECT * FROM connections");
    if (rows)
    {
        for(var i=0; i < rows.rowCount(); i++)
        {
            if (rows.fieldByName('name') == name)
            {
                $('err').update("* Connection name already existed, please choose another one.");
                db.close();
                return false;
            }
            rows.next();
        }
    }
    db.execute("insert into connections (name, host, port) values ('" + name + "','" + host + "'," + port + ")");
    db.close();
    Titanium.UI.getCurrentWindow().close();
}

function editConnection(name, host, port, old_name)
{
    name = name.strip();
    host = host.strip();
    port = port.strip();
    old_name = old_name.strip();
    if (name.empty())
    {
        $('err').update("* Please input a name for this connection.");
        return false;
    }else if (host.empty()) {
        $('err').update("* Please input the host address.");
        return false;
    }else if (port.empty()) {
        $('err').update("* Please input the port.");
        return false;
    }
    var db = Titanium.Database.open('mongohub');
    db.execute("CREATE TABLE IF NOT EXISTS connections (name TEXT, host TEXT, port INT)");
    var rows = db.execute("SELECT * FROM connections");
    if (rows)
    {
        var counter = 0;
        for(var i=0; i < rows.rowCount(); i++)
        {
            if (rows.fieldByName('name') == name)
            {
                counter ++;
                if (counter > 0)
                {
                    $('err').update("* Connection name already existed, please choose another one.");
                    db.close();
                    return false;
                }
            }
            rows.next();
        }
    }
    db.execute("UPDATE connections SET name='" + name + "', host='" + host + "', port=" + port + " WHERE name='" + old_name + "'");
    db.close();
    Titanium.UI.getCurrentWindow().close();
}

function removeConnection(name)
{
    name = name.strip();
    var db = Titanium.Database.open('mongohub');
    db.execute("CREATE TABLE IF NOT EXISTS connections (name TEXT, host TEXT, port INT)");
    db.execute("DELETE FROM connections WHERE name='" + name + "'");
    db.close();
}

function loadConnection()
{
    var db = Titanium.Database.open('mongohub');
    try
    {
        var rows = db.execute("SELECT * FROM connections");
    }catch(e){
        var rows = null;
    }finally{
        db.close();
    }
    var connections = new Array();
    if (!rows) return connections;
    for(var i=0; i < rows.rowCount(); i++)
    {
        connections.push({name: rows.fieldByName('name'), host: rows.fieldByName('host'), port: rows.fieldByName('port')});
        rows.next();
    }
    return connections;
}

function dropDB(cname, dbname)
{
    cname = cname.strip();
    dbname = dbname.strip();
    var connections = loadConnection();
    var connection = connection_info(cname, connections);
    if (!connection)
    {
        alert('Unexpected error!');
        return false;
    }
    mongo.drop_database(connection.host, connection.port, dbname);
}

function browseCollection(connection_name, db_name, collection_name, page, step)
{
    connection_name = connection_name.strip();
    db_name = db_name.strip();
    collection_name = collection_name.strip();
    var connections = loadConnection();
    var connection = connection_info(connection_name, connections);
    if (!connection)
    {
        alert('Unexpected error!');
        return false;
    }
    var entries = mongo.browse_collection(connection.host, connection.port, db_name, collection_name, page, step);
    if (entries == -1)
    {
        alert('Unexpected error!');
        return false;
    }
    $('total').update(entries['count']);
    var html = '<ul class="entries">';
    entries['entries'].each(function(e){
        html += '<li class="entry"><table>';
        Object.keys(e).each(function(f){
            html += '<tr><td class="key">' + f + '</td><td class="value">' + e[f] + '</td></tr>';
        });
        html += '</table></li>';
    });
    html += '</ul>';
    $('entries-list').update(html);
}

function dropCollection(connection_name, db_name, collection_name)
{
    connection_name = connection_name.strip();
    db_name = db_name.strip();
    collection_name = collection_name.strip();
    var connections = loadConnection();
    var connection = connection_info(connection_name, connections);
    if (!connection)
    {
        alert('Unexpected error!');
        return false;
    }
    mongo.drop_collection(connection.host, connection.port, db_name, collection_name);
}

function runQuery(connection_name, dbname, query)
{
    connection_name = connection_name.strip();
    dbname = dbname.strip();
    query = query.strip();
    var connections = loadConnection();
    var connection = connection_info(connection_name, connections);
    if (!connection)
    {
        alert('Unexpected error!');
        Titanium.UI.getCurrentWindow().close();
    }
    var entries = mongo.query(connection.host, connection.port, dbname, query);
    if (entries == -1)
    {
        alert('Unexpected error!');
        Titanium.UI.getCurrentWindow().close();
    }else if (entries == -2)
    {
        alert('Invalid Query!');
        Titanium.UI.getCurrentWindow().close();
    }
    if (Object.isString(entries))
    {
        var html = '<ul class="entries"><li class="entry">' + entries + '</li></ul>';
    }else{
        $('total').update(entries['count']);
        var html = '<ul class="entries">';
        entries['entries'].each(function(e){
            html += '<li class="entry"><table>';
            Object.keys(e).each(function(f){
                html += '<tr><td class="key">' + f + '</td><td class="value">' + e[f] + '</td></tr>';
            });
            html += '</table></li>';
        });
        html += '</ul>';
        $('collection-meta').show();
    }
    $('entries-list').update(html);
}