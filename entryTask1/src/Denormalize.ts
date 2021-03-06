import { DataType, EntitiesType } from "./commonInterface";
import EntitySchema from "./EntitySchema";
import { schema } from "./Normalize";

/**
 * ??????
 * deNormalize(data, entity)
 * @param ObjectId:需要反范式的id的数组
 * @param entity 最外层的实体
 * @param entities 范式化数据
 */
export const denormalize = (result: string, entity: EntitySchema, entities: EntitiesType) => {
  return getUnFlatten(entities)(entity, result)
}

const getUnFlatten = (entities: EntitiesType) => {
  const cache = {};
  const getEntity = getEntities(entities);
  return function unFlatten(entity: EntitySchema, result: string) {
    const isEntitySchema = entity instanceof EntitySchema;
    return isEntitySchema
      ? schemaDeNormalize(entity, result, unFlatten, getEntity, cache)
      : noSchemaDeNormalize(entity, result, unFlatten)
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
  return typeof entityOtId === 'object' ? entityOtId : entities[schemaKey][entityOtId]
}

/**
 * 传入的是schema实例
 * @param entity 
 * @param data 
 * @param unFlatten 
 * @param getEntity 
 * @param cache 输出的反范式化的对象
 * @returns 主键id对应的对象
 */

const schemaDeNormalize = (entity: EntitySchema, id: string, unFlatten: any, getEntity: any, cache: EntitiesType) => {
  // 拿到主键id对应的对象
  const obj = getEntity(entity, id);
  const schemaKey = entity.getName();

  // 当前data的数据
  const processedEntity = { ...obj };
  // 当前的shcema
  const currentSchema = entity.schema;

  if (!cache[schemaKey]) {
    cache[schemaKey] = {}
  }
  if (!cache[schemaKey][id]) {
    // 递归，从最外层递归到最里层
    Object.keys(currentSchema).forEach(key => {
      // 当前data存在属性值
      if (processedEntity.hasOwnProperty(key)) {
        // 属性值可为shcema实例，也可存在Object类型
        const value = currentSchema[key];

        // 将获得的value赋值给原key的属性
        processedEntity[key] = unFlatten(value, processedEntity[key])
      }
    })
    // 将id的value赋值给求的cache对象
    cache[schemaKey][id] = processedEntity;
  }

  return cache[schemaKey][id];
}

/**
 * 传入的不是schema实例
 * @param entity 
 * @param data 
 * @param unFlatten 
 * @returns  Object
 */

const noSchemaDeNormalize = (entity: any, data: any, unFlatten: any) => {
  const object = { ...data };

  const arr: any[] = [];
  const schemaIsArray = entity instanceof Array;

  Object.keys(entity).forEach(key => {
    /**
     * 如果是对象
     * 将获得的value赋值给原key的属性
     * 如果是数组，则直接push
     */
    let objectValue = unFlatten(entity[key], object[key]);
    if (object[key]) {
      object[key] = objectValue;
    }
    schemaIsArray && arr.push(objectValue);
  })

  return schemaIsArray ? arr : object
}

