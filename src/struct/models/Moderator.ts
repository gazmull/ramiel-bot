import { Column, DataType, Model, PrimaryKey, Table } from 'sequelize-typescript';

@Table({ tableName: 'moderators', charset: 'utf8', collate: 'utf8_unicode_ci' })
export default class Moderator extends Model<Moderator> {
  @PrimaryKey
  @Column({ type: DataType.STRING({ length: 32 }) })
  public guild: string;

  @Column({ type: DataType.STRING({ length: 32 }) })
  public role: string;
}
