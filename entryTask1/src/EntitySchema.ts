import { DataType, EntityConfigKeyType } from './commonInterface';
/**
 * schema.Entity(name, [entityParams], [entityConfig])
 * @param name schema名称
 * @param entityParams 该schema的外键
 * @param entityConfig 该schema的主键
 * schema{
 *  name:<schema 名称>,
 *  idAttribute:<schema 主键>,
 *  schema:<entityParams>
 * }
 */
export default class EntitySchema {
  name: string;
  idAttribute: string;
  schema: DataType = {};
  constructor(name: string, entityParams: DataType = {}, entityConfig: EntityConfigKeyType = {}) {
    this.name = name;
    this.idAttribute = entityConfig.idAttribute || 'id';;
    this.init(entityParams);
  }

  // 获取schema的名字
  getName() {
    return this.name
  }

  // 获取主键value
  getId(input: DataType) {
    let key = this.idAttribute;
    return input[key]
  }

  /**
   * 因为entityParams可能会存在嵌套的问题
   * 遍历当前schema中的entityParams的所有属性
   */
  init(entityParams: DataType) {
    // 初始化schema对象
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

