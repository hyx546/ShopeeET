import { DataType, EntitiesType } from "./commonInterface";
import EntitySchema from "./EntitySchema";

/**
 * ??????
 * deNormalize(data, entity)
 * @param data:反范式化数据
 * @param entity 最外层的实体
 * @param entities 范式化数据
 */
export const deNormalize = (data: DataType, entity: EntitySchema, entities: EntitiesType) => {

}


const unFlatten = (entity: EntitySchema, data: DataType) => {
  const isEntitySchema = entity instanceof EntitySchema;
  return isEntitySchema ? schemaDeNormalize() : noSchemaDeNormalize()
}

/**
 * 传入的是schema实例
 */

const schemaDeNormalize = () => {

}

/**
 * 传入的不是schema实例
 */

 const noSchemaDeNormalize = () => {
  
}

