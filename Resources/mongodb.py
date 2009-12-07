#!/usr/bin/env python
# encoding: utf-8

from types import *
from time import *
from datetime import datetime
from pymongo import Connection as MongoConnection
from pymongo import database
from pymongo import collection as MongoCollection
from pymongo.cursor import Cursor

class MongoDB:
    
    def show_dbs(self, host, port):
        try:
            c = MongoConnection(host=host, port=int(port), pool_size=1)
            dbs = c.database_names()
        except Exception, err:
            return -1
        return dbs
    
    def show_collections(self, host, port, dbname):
        try:
            c = MongoConnection(host=host, port=int(port), pool_size=1)
            db = database.Database(c, dbname)
            collections = db.collection_names()
        except Exception, err:
            return -1
        return collections
    
    def drop_collection(self, host, port, dbname, collection_name):
        try:
            c = MongoConnection(host=host, port=int(port), pool_size=1)
            db = database.Database(c, dbname)
            db.drop_collection(collection_name)
        except Exception, err:
            return -1
        return db
    
    def drop_database(self, host, port, dbname):
        try:
            c = MongoConnection(host=host, port=int(port), pool_size=1)
            c.drop_database(dbname)
        except Exception, err:
            return -1
        return c
    
    def browse_collection(self, host, port, dbname, collection_name, page, step):
        try:
            c = MongoConnection(host=host, port=int(port), pool_size=1)
            db = database.Database(c, dbname)
            cl = MongoCollection.Collection(db, collection_name)
            res = cl.find(skip = (int(page) -1) * int(step), limit = int(step))
            entries = []
            for r in res:
                tmp = {}
                for k, v in r.items():
                    if isinstance(v, datetime):
                        tmp[k] = strftime('%Y-%m-%d %X', datetime.timetuple(v))
                    else:
                        tmp[k] = v
                entries.append(tmp)
            return {'count':cl.count(), 'entries': entries}
        except Exception, err:
            return -1
        return collections
    
    def query(self, host, port, dbname, query):
        try:
            c = MongoConnection(host=host, port=int(port), pool_size=1)
            db = database.Database(c, dbname)
            if not query.startswith('db.'):
                return -2
            res = eval(query)
            if isinstance(res, (GeneratorType, ListType, Cursor)):
                entries = []
                try:
                    for r in res:
                        tmp = {}
                        for k, v in r.items():
                            if isinstance(v, datetime):
                                tmp[k] = strftime('%Y-%m-%d %X', datetime.timetuple(v))
                            else:
                                tmp[k] = v
                        entries.append(tmp)
                    return {'count':len(entries), 'entries': entries}
                except:
                    return str(res)
            else:
                return str(res)
        except Exception, err:
            return -1
        return collections