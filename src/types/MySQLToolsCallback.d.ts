/*
 * @Author: iy88 
 * @Date: 2021-01-26 17:28:52 
 * @Last Modified by:   iy88 
 * @Last Modified time: 2021-01-26 17:28:52 
 */
import { MysqlError } from "mysql";

declare interface MySQLToolsCallback {
  (error: MysqlError?, resutls?, fields?): void;
}