import { Connection } from "mysql";

declare interface mysqlConnection extends Connection{
  release();
}