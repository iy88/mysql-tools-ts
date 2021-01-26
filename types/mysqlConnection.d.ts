/*
 * @Author: iy88 
 * @Date: 2021-01-26 17:28:54 
 * @Last Modified by:   iy88 
 * @Last Modified time: 2021-01-26 17:28:54 
 */
import { Connection } from "mysql";

declare interface mysqlConnection extends Connection{
  release();
}