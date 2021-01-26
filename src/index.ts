/*
 * @Author: iy88 
 * @Date: 2021-01-25 22:37:51 
 * @Last Modified by: iy88
 * @Last Modified time: 2021-01-26 17:36:01
 */
import { default as mysql, MysqlError } from 'mysql';
import { ConnectionOptions, Pool } from "mysql";
import { mysqlConnection } from '../types/mysqlConnection';
import { MySQLToolsCallback } from '../types/MySQLToolsCallback';
import selectGenerator from "./sql-generators/select";
/**
 * @constructor MySQLTools
 */
class MySQLTools {
  /**
   * MySQLtools constructor
   * @param config
   * @param logger 
   */
  constructor(public config?: ConnectionOptions, public logger?: logger) {
    if (config) {
      this.pool = mysql.createPool(config);
      this.config = config;
    }
    if (logger) {
      this.logger = logger;
    }
  }

  public pool!: Pool

  public __promise__?: Promise<any>

  public db?: string

  /**
   * mysql config
   * @param config 
   */
  public conf(config?: ConnectionOptions) {
    if (config) {
      this.pool = mysql.createPool(config);
      this.config = config;
      return this;
    } else {
      throw new ReferenceError('param lose');
    }
  }

  /**
   * then
   * @param resolve 
   * @param reject 
   */
  public then(resolve: any, reject: any) {
    if (this.__promise__) {
      return this.__promise__.then(resolve, reject);
    } else {
      return Promise.resolve(undefined).then(resolve, reject);
    }
  }

  /**
   * use database
   * @param databaseName
   */
  public use(databaseName: string) {
    if (databaseName) {
      this.db = databaseName;
      return this;
    } else {
      throw new ReferenceError('param lose');
    }
  }

  /**
   * do sql
   * @param sql 
   * @param cb 
   */
  public doSql(sql: string, cb?: MySQLToolsCallback) {
    if (this.pool) {
      if (cb) {
        this.pool.getConnection((getConnectionError: MysqlError, connection: mysqlConnection) => {
          getConnectionError ? cb(getConnectionError) : '';
          if (this.logger) {
            this.logger(mysql.format(sql, []));
          }
          connection.query(mysql.format(sql, []), (error, results, fields) => {
            cb(error, results, fields);
            connection.release();
          });
        })
      } else {
        this.__promise__ = new Promise((resolve: any, reject: any) => {
          this.pool.getConnection((getConnectionError: MysqlError, connection: mysqlConnection) => {
            getConnectionError ? reject(getConnectionError) : '';
            if (this.logger) {
              this.logger(mysql.format(sql, []));
            }
            connection.query(mysql.format(sql, []), (queryError, results, fields) => {
              resolve({ error: queryError, results, fields });
              connection.release();
            });
          })
        })
      }
      return this;
    } else {
      throw new ReferenceError('please config first');
    }
  }

  /**
   * create
   * @param type 
   * @param name 
   * @param any 
   * @param cb 
   */
  public create(type: string, name: string, any: MySQLToolsCallback | createOptions, cb: MySQLToolsCallback) {
    if (this.pool) {
      if (type === 'table') {
        if (name) {
          let sql: string = `create table `;
          if (typeof any === 'object' && any.checkExists === true) {
            sql += 'if not exists ';
          }
          sql += name;
          if (typeof any === 'object' && any.desc) {
            sql += '(';
            let keys = Object.keys(any.desc);
            for (let i = 0; i < keys.length; i++) {
              sql += keys[i] + ' ' + any.desc[keys[i]];
              if (i !== keys.length - 1) {
                sql += ',';
              }
            }
            sql += ')';
          } else if (typeof any === 'string') {
            sql += any;
          }
          if (any && typeof any === 'function' || typeof cb === 'function') {
            return this.doSql(sql, cb || any);
          } else {
            return this.doSql(sql);
          }
        } else {
          throw new Error('please input name');
        }
      } else if (type === 'database') {
        if (name) {
          let sql = `create database `;
          if (<checkExists><unknown>any === true) {
            sql += 'if not exists ';
          }
          sql += name;
          if (typeof any === 'function' || typeof cb === 'function') {
            return this.doSql(sql, cb || any);
          } else {
            return this.doSql(sql);
          }
        } else {
          throw new Error('please input name');
        }
      }
    } else {
      throw new Error('please config first');
    }
  }

  /**
   * select
   * @param columns columns (string | array) 
   * @param table table name 
   * @param any where and limit or callback function 
   * @param cb callback function
   */
  public select(columns: string | string[], table: string, any?: selectOptions | MySQLToolsCallback, cb?: MySQLToolsCallback) {
    if (this.pool) {
      if (this.config!.database || this.db) {
        if (typeof any === 'object') {
          let sql: string = selectGenerator(columns, table, any?.where, any?.orderBy, any?.limit);
          if (cb) {
            return this.doSql(sql, cb);
          } else {
            return this.doSql(sql);
          }
        } else if (typeof any === 'function') {
          let sql: string = selectGenerator(columns, table);
          return this.doSql(sql, any);
        }
        if (cb) {
          let sql: string = selectGenerator(columns, table, (any as selectOptions | undefined)?.where, (any as selectOptions | undefined)?.orderBy, (any as selectOptions | undefined)?.limit);
          return this.doSql(sql, cb);
        }
      } else {
        throw new Error('database not config');
      }
    } else {
      throw new Error('please config first');
    }
  }

  /**
   * insert
   * @param table 
   * @param pairs 
   * @param cb 
   */
  public insert(table: string, pairs: pairs, cb: MySQLToolsCallback) {
    if (this.pool) {
      if (table) {
        if (pairs) {
          let sql = `insert into ${table} (${Object.keys(pairs).join()}) values (`;
          for (let i = 0; i < Object.keys(pairs).length; i++) {
            typeof pairs[Object.keys(pairs)[i]] === 'number' ? sql += pairs[Object.keys(pairs)[i]] : sql += `'${pairs[Object.keys(pairs)[i]]}'`;
            if (i !== Object.keys(pairs).length - 1) {
              sql += ',';
            }
          }
          sql += ')';
          if (cb) {
            return this.doSql(sql, cb);
          } else {
            return this.doSql(sql);
          }
        } else {
          throw new Error('please input data');
        }
      } else {
        throw new Error('please input table name');
      }
    } else {
      throw new Error('please config first');
    }
  }

  /**
   * update
   * @param table 
   * @param pairs 
   * @param any 
   * @param cb 
   */
  public update(table: string, pairs: pairs, any: updateOptions, cb: MySQLToolsCallback) {
    if (this.pool) {
      if (table) {
        if (pairs) {
          let sql: string = `update ${table} set `
          let keys: string[] = Object.keys(pairs);
          for (let i: number = 0; i < keys.length; i++) {
            typeof pairs[keys[i]] === 'number' ? sql += `${keys[i] + '=' + pairs[keys[i]]}` : sql += `${keys[i] + '="' + pairs[keys[i]]}"`;
            if (i !== Object.keys(pairs).length - 1) {
              sql += ',';
            }
          }
          if (typeof any === 'object') {
            sql += ' where ';
            typeof any.main[Object.keys(any.main)[0]] === 'number' ? sql += Object.keys(any.main)[0] + '=' + any.main[Object.keys(any.main)[0]] : sql += Object.keys(any.main)[0] + '="' + any.main[Object.keys(any.main)[0]] + '"';
            if (any.ands) {
              for (let i = 0; i < any.ands.length; i++) {
                let key: string = Object.keys(any.ands[i])[0];
                let value: string | number = any.ands[i][key];
                typeof value === 'number' ? sql += ` and ${key}=${value}` : sql += ` and ${key}='${value}'`;
              }
            }
            if (any.ands && any.or) {
              let key: string = Object.keys(any.or)[0];
              let o: pair = any.or;
              typeof o[key] === 'number' ? sql += ` or ${key}=${o[key]}` : sql += ` or ${key}='${o[key]}'`;
            }
          } else if (typeof any === 'string') {
            sql += any;
          }
          if (typeof any === 'function' || typeof cb === 'function') {
            return this.doSql(sql, cb || any);
          } else {
            return this.doSql(sql);
          }
        } else {
          throw new Error('please input data');
        }
      } else {
        throw new Error('please input table name')
      }
    } else {
      throw new Error('please config first');
    }
  }

  /**
   * delete
   * @param table 
   * @param any 
   * @param cb 
   */
  public delete(table: string, any: MySQLToolsCallback | deleteOptions, cb: MySQLToolsCallback) {
    if (this.pool) {
      if (table) {
        let sql: string = `delete from ${table}`;
        if (typeof any === 'object') {
          if (any.where?.main) {
            sql += ' ';
            let key: string = Object.keys(any.where!.main)[0];
            let value: string | number = any.where?.main[key];
            typeof value === 'number' ? sql += `${key}=${value}` : `${key}='${value}'`;
          }
          if (any.where?.main && any.where?.ands) {
            let keys = Object.keys(any.where.ands);
            for (let i = 0; i < keys.length; i++) {
              typeof any.where.ands[i][keys[i]] === 'number' ? sql += ` and ${keys[i]}=${any.where.ands[i][keys[i]]}` : sql += ` and ${keys[i]}='${any.where.ands[i][keys[i]]}'`;
            }
          }
        }
        if (typeof any === 'function' || typeof cb === 'function') {
          return this.doSql(sql, cb || any);
        } else {
          return this.doSql(sql);
        }
      } else {
        throw new ReferenceError('please input table name');
      }
    } else {
      throw new ReferenceError('please config first');
    }
  }

  /**
   * drop
   * @param type 
   * @param name 
   * @param any 
   * @param cb 
   */
  public drop(type: string, name: string, any: checkExists | MySQLToolsCallback, cb: MySQLToolsCallback) {
    if (this.pool) {
      if (type === 'database' || type === 'table') {
        if (name) {
          let sql = `drop ${type} `;
          if (any === true) {
            sql += 'if exists ';
          }
          sql += name;
          if (typeof cb === 'function' || typeof any === 'function') {
            return this.doSql(sql, cb || any);
          } else {
            return this.doSql(sql);
          }
        } else {
          throw new Error('please input name');
        }
      } else {
        throw new Error('type is not support');
      }
    } else {
      throw new Error('please config first');
    }
  }

  /**
   * truncate
   * @param type 
   * @param name 
   * @param cb 
   */
  public truncate(type: string, name: string, cb?: MySQLToolsCallback) {
    if (type) {
      if (name) {
        let sql = `truncate ${type} ${name}`;
        if (typeof cb === 'function') {
          return this.doSql(sql, cb);
        } else {
          return this.doSql(sql);
        }
      } else {
        throw new Error('please input name');
      }
    } else {
      throw new Error('please input type');
    }
  }

}

module.exports = MySQLTools;
