// entity的主键
interface EntityConfigType {
  idAttribute?: string
}
// schema的外键
interface EntityConfigType {
  [propsName: string]: string | number;
}

/**
 * schema.Entity(name, [entityParams], [entityConfig])
 * @param name schema名称
 * @param entityParams 该schema的外键
 * @param entityConfig 该schema的主键
 */
export default class EntitySchema {
  name: string;
  idAttribute: string;
  schema: EntityConfigType;
  constructor(name: string, entityParams: EntityConfigType = {}, entityConfig: EntityConfigType = {}) {
    const idAttribute = entityConfig.idAttribute || 'id';
    this.name = name;
    this.idAttribute = idAttribute;
    this.init(entityParams);
  }


  // 获取schema的名字
  getName() {
    return this.name
  }

  // 获取主键id
  getId(input) {
    let key = this.idAttribute;
    return input[key]
  }

  /**
   * 因为entityParams可能会存在嵌套的问题
   * 遍历当前schema中的entityParams的所有属性
   */
  init(entityParams: EntityConfigType) {
    if (!this.schema) {
      this.schema = {}
    }
    for (let key in entityParams) {
      if (entityParams.hasOwnProperty(key)) {
        this.schema[key] = entityParams[key]
      }
    }
  }
}

