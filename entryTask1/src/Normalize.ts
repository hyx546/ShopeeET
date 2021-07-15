import EntitySchema from './EntitySchema';

interface SchemaType {
  [propsName: string]: string | number
}
interface DataType {
  [propsName: string]: string | number | Object | Array<DataType>;
}

/**
 * 1.首先考虑最外层实体嵌套问题
 * 递归最外层实体，递归到最里层，在往外层延伸
 * 最后返回需要用外键访问的属性
 * 
 * 2.考虑到最外层实体对象的属性不一定是个schema实例，也可能是个数组
 * @param entities 
 * @returns 
 */
const flatten = (entity: any, data: any, addEntity: any) => {
  if (typeof entity.getName === 'undefined') {
    return noSchemaNormalize(entity, data, addEntity, flatten)
  }
  return schemaNormalize(entity, data, addEntity, flatten)
}


/**
 * 获得对应的schema的name所包含的id，和此id指向的对象
 * @param entities 
 */
const addEntities = (entities: DataType) => (schema: any, processedEntity: DataType) => {
  // 获取schema的name作为key
  // console.log('------schema', schema);
  // console.log('-----type', schema instanceof EntitySchema);

  // schema是EntitySchema实例？

  const schemaKey = schema.getName();
  // console.log('---schemaKey', schemaKey);

  const id = schema.getId(processedEntity);

  // 如果entities实体不存在name属性，该name指向的对象设为{}
  if (!(schemaKey in entities)) {
    entities[schemaKey] = {}
  }

  // schema-name对应的id对象
  // @ts-ignore
  const existEntity = entities[schemaKey][id];

  // id对象存在则需要进行对象合并
  // @ts-ignore
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

const noSchemaNormalize = (entity: any, data: any, addEntity: any, flatten: ((entity: { getName: any; }, data: any, addEntity: any) => any) | undefined) => {
  console.log('-----非实体情况');
  /**
   * 非schema的实例需要分别处理对象类型和数组类型
   * 初始化
   * @param object 对象类型
   * @param arr 数组类型
   */
  const object = { ...data };
  const arr = [];

}

/**
 * 
 * 传入的entity是一个schema的实例
 * @param entity 
 * @param data 
 * @param addEntity 
 */
const schemaNormalize = (entity: any, data: any, addEntity: any, flatten: ((entity: { getName: any; }, data: any, addEntity: any) => any) | undefined) => {
  // console.log('-----entity', entity);
  // console.log('-----data', data);

  const processedEntity = { ...data };
  const currentEntity = entity;


  // 目前实例的嵌套schema
  const currentSchema = currentEntity.schema;
  currentSchema && Object.keys(currentSchema).forEach((key) => {
    // 当前实体key指向的对象
    // console.log('-----key', key);
    const schema = currentEntity.schema[key];
    const temple = flatten && flatten(schema, processedEntity[key], addEntity);
    processedEntity[key] = temple;
  })
  // 调用 addEntities方法进行获取对应id的实体
  // console.log('------currentEntity', currentEntity);

  addEntity(currentEntity, processedEntity);

  return currentEntity.getId(data)
}

/**
 * normalize(data, entity)
 * @param data 需要被范式化的数据
 * @param entity 最外层的实体
 */
export const normalize = (data: DataType, entity: any) => {
  const entities = {};

  const addEntity = addEntities(entities);

  const result = flatten(entity, data, addEntity);

  // 返回主属性，需要用外键来引用的的属性
  return { entities, result }
}



/**
 * 暴露出schema对象，内含Entity的构造方法
 */

export const schema = {
  Entity: EntitySchema
}