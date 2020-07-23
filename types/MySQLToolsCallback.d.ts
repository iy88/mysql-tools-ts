import { MysqlError } from "mysql";

declare interface MySQLToolsCallback {
  (error: MysqlError?, resutls?, fields?): void;
}