//  data和实例的数据格式
export interface DataType {
  [propsName: string]: string | number | Object | Array<DataType>;
}

// entity的主键
export interface EntityConfigKeyType {
  idAttribute?: string
}


// entities的类型
export interface EntitiesType {
  [propsName: string]: { [propsName: string]: DataType }
}