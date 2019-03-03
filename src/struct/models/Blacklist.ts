import { Column, DataType, Model, PrimaryKey, Table } from 'sequelize-typescript';

@Table
export default class Blacklist extends Model<Blacklist> {
  @PrimaryKey
  @Column({ type: DataType.STRING({ length: 32 }) })
  public user: string;

  @Column({ type: DataType.STRING({ length: 32 }) })
  public admin: string;

  @Column({ defaultValue: null })
  public reason: string;
}
