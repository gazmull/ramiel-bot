import { Column, Model, PrimaryKey, Table } from 'sequelize-typescript';

@Table
export default class Blacklist extends Model<Blacklist> {
  @PrimaryKey
  @Column
  public user: string;

  @Column
  public admin: string;

  @Column({ defaultValue: null })
  public reason: string;
}
