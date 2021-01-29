/*
 * @Author: iy88 
 * @Date: 2021-01-26 17:28:38 
 * @Last Modified by: iy88
 * @Last Modified time: 2021-01-26 17:33:16
 */
type limit = [number,number];
declare interface selectOptions {
  where?: pair,
  orderBy?:string,
  limit?: limit,
}