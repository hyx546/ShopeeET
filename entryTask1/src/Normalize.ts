import EntitySchema from './EntitySchema';
import { DataType,EntitiesType } from './commonInterface';



/**
 * 1.首先考虑最外层实体嵌套问题
 * 递归最外层实体，递归到最里层，在往外层延伸
 * 
 * 2.考虑到最外层实体对象的属性不一定是个EntitySchema实例，也可能是个数组
 * @param entities 
 * @returns 
 */
const flatten = (entity: EntitySchema, data: DataType, addEntity: any) => {
  // 实体对象不是schema实例的情况
  if (!(entity instanceof EntitySchema)) {
    return noSchemaNormalize(entity, data, addEntity, flatten)
  }
  // 是schema实例调用这个方法
  return schemaNormalize(entity, data, addEntity, flatten)
}

/**
 * 获得对应的schema的name所包含的id，和此id指向的对象
 * @param entities  
 * @param schema 实体
 * @param processedEntity 当前实例的data
 */
const addEntities = (entities: EntitiesType) => (schema: { getName: () => any; getId: (arg0: DataType) => any; }, processedEntity: DataType) => {
  // 获取schema实例的name
  const schemaKey = schema.getName();

  // 获取当前data的主键
  const id = schema.getId(processedEntity);

  // 如果entities实体不存在name属性，该name所对应的value设为{}
  if (!(schemaKey in entities)) {
    entities[schemaKey] = {}
  }

  // schema-name的主键是否存在
  const existEntity = entities[schemaKey][id];

  // id对象存在则需要进行对象合并，不存在直接赋值
  entities[schemaKey][id] = existEntity
    ? Object.assign(existEntity, processedEntity)
    : processedEntity;

}

/**
 * 传入的entity不是一个schema的实例
 * @param entity 
 * @param data 
 * @param addEntity 
 * @param flatten 
 * @returns 
 */
const noSchemaNormalize = (entity: DataType, data: DataType, addEntity: EntitySchema, flatten: any) => {
  /** 
   * 非schema的实例需要分别处理对象类型和数组类型
   * 初始化
   * @param =object 对象类型
   * @param arr 数组类型
   * @param schemaIsArray 实体是否是数组
   */
  const object = { ...data };
  const arr: any[] = [];
  const schemaIsArray = entity instanceof Array;
  /**
   * entity
   * {
      result: [
        EntitySchema {
          name: 'comments',
          idAttribute: 'id',
          schema: [Object]
        }
      ]
    }
   */
  Object.keys(entity).forEach(key => {
    /**
     * data { total: 100, result: [ { id: '324', commenter: [Object] } ] }
     */
    const currentEntity = entity[key];
    // 实例id对应的value
    const value = flatten(currentEntity, data[key], addEntity)
    schemaIsArray ? arr.push(value) : object[key] = value;
  })

  // 根据实例类型返回对象还是数组类型
  return schemaIsArray ? arr : object
}

/**
 * 
 * 传入的entity是一个schema的实例
 * 返回实例id的value
 * @param entity 
 * @param data 
 * @param addEntity 
 */
const schemaNormalize = (entity: EntitySchema, data: DataType, addEntity: any, flatten: any) => {
  /**
   * 初始化
   * @param processedEntity 当前操作的data
   * @param currentEntity 当前操作的schema实例 
   */
  const processedEntity = { ...data };
  const currentEntity = entity;

  // 目前实例的嵌套schema
  const currentSchema = currentEntity.schema;

  // 遍历schema的属性
  Object.keys(currentSchema).forEach((key) => {
    // 保存当前schema的属性的value
    const schema = currentSchema[key];

    // 返回当前key的期望value
    const temple = flatten(schema, processedEntity[key], addEntity);

    // 将新获取的外键取代原有的属性内容
    processedEntity[key] = temple;
  })

  // 调用 addEntities方法进行获取对应id的实体
  addEntity(currentEntity, processedEntity);

  return currentEntity.getId(data)
}

/**
 * normalize(data, entity)
 * @param data 需要被范式化的数据
 * @param entity 最外层的实体
 */
export const normalize = (data: DataType, entity: EntitySchema) => {
  const entities = {};
  /**
   * log entity 
   * EntitySchema {
      name: 'articles',
      idAttribute: 'id',
      schema: {
        author: EntitySchema { name: 'users', idAttribute: 'uid', schema: {} },
        comments: { result: [Array] }
      }
    }
   */
  const addEntity = addEntities(entities);

  // 最外层实体的id对应的value（主键）
  const result = flatten(entity, data, addEntity);


  /**
   * 返回主属性，需要用外键来引用的的属性 
   * @param result 主键
   * @param entities 范式化数据
   */
  return { entities, result }
}



/**
 * 暴露出schema对象，内含Entity的构造方法
 */

export const schema = {
  Entity: EntitySchema
}