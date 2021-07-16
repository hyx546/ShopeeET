import { DataType, EntitiesType } from "./commonInterface";
import EntitySchema from "./EntitySchema";
import { schema } from "./Normalize";

/**
 * ??????
 * deNormalize(data, entity)
 * @param data:反范式化数据
 * @param entity 最外层的实体
 * @param entities 范式化数据
 */
export const denormalize = (data: any, entity: EntitySchema, entities: EntitiesType) => {

  return getUnFlatten(entities)(entity, data)
}

const getUnFlatten = (entities: EntitiesType) => {
  const cache = {};
  const getEntity = getEntities(entities);
  return function unFlatten(entity: EntitySchema, data: DataType) {
    const isEntitySchema = entity instanceof EntitySchema;
    return isEntitySchema
      ? schemaDeNormalize(entity, data, unFlatten, getEntity, cache)
      : noSchemaDeNormalize(entity, data, unFlatten)
  }
}


/**
 * 用来获取对应schema的某个id对应的对象
 * @param entities 
 * @returns 
 */
const getEntities = (entities: EntitiesType) => (entity: EntitySchema, entityOtId: DataType) => {
  // 获取schema的name
  const schemaKey = entity.getName();

  console.log('--------entityOtId', entityOtId);

  return typeof entityOtId === 'object' ? entityOtId : entities[schemaKey][entityOtId]
}

/**
 * 传入的是schema实例
 */

const schemaDeNormalize = (entity: EntitySchema, data: any, unFlatten: any, getEntity: any, cache: EntitiesType) => {
  const obj = getEntity(entity, data);
  const processedEntity = { ...obj };

  const currentSchema = entity.schema;

  const schemaKey = entity.getName();

  if (!cache[schemaKey]) {
    cache[schemaKey] = {}
  }
  if (!cache[schemaKey][data]) {
    Object.keys(currentSchema).forEach(key => {
      if (processedEntity.hasOwnProperty(key)) {
        const uschema = currentSchema[key]
        processedEntity[key] = unFlatten(uschema, processedEntity[key])
      }
    })
    cache[schemaKey][data] = processedEntity;
  }

  return cache[schemaKey][data];

}

/**
 * 传入的不是schema实例
 */

const noSchemaDeNormalize = (entity: any, data: DataType, unFlatten: any) => {
  const object = { ...data };
  const arr: any[] = [];
  const schemaIsArray = entity instanceof Array;

  Object.keys(entity).forEach(key => {
    let objectValue = unFlatten(entity[key], object[key]);
    if (schemaIsArray) {
      if (object[key]) {
        object[key] = objectValue;
      }
      arr.push(objectValue)
    } else {
      if (object[key]) {
        object[key] = objectValue;
      }
    }
  })

  return schemaIsArray ? arr : object
}

