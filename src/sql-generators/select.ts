/*
 * @Author: iy88 
 * @Date: 2021-01-25 22:37:55 
 * @Last Modified by: iy88
 * @Last Modified time: 2021-01-26 18:03:22
 */
/**
 * select sql generator
 * @param columns 
 * @param tableName 
 * @param where 
 * @param orderBy 
 * @param limit 
 */
function generator(columns: string[] | string, tableName: string, where?: pair | string, orderBy?: string, limit?: [number, number?] | string): string {
  let sql: string;
  let columnsString: string;
  let whereString: string = '';
  let orderByString: string = '';
  let limitString: string = '';
  if (typeof columns === "object") {
    columnsString = columns.join('');
  } else {
    columnsString = columns;
  }
  if (typeof where === 'object') {
    let keys: string[] = Object.keys(where);
    if (keys.length !== 0) {
      whereString = `where ${keys[0]}=${typeof where[keys[0]] === "number" ? where[keys[0]] : `'${where[keys[0]]}'`}`;
      keys.shift();
    }
    keys.forEach(key => {
      whereString += ` and ${key}=${typeof where[key] === "number" ? where[key] : `'${where[key]}'`}`;
    });
  } else if (where) {
    whereString = where;
  }
  if (orderBy) {
    orderByString = `order By ${orderBy}`;
  }
  if (typeof limit === 'object') {
    if (limit.length > 1) {
      limitString = `limit ${limit[0]},${limit[1]}`;
    } else {
      limitString = `limit ${limit[0]}`;
    }
  } else if (limit) {
    limitString = limit;
  };
  sql = `select ${columnsString} from ${tableName}${whereString !== '' ? ` ${whereString}` : ''}${orderByString !== '' ? ` ${orderByString}` : ''}${limitString !== '' ? ` ${limitString}` : ''}`;
  return sql;
}

export default generator;
