import { Column, DataType, Model, PrimaryKey, Table } from 'sequelize-typescript';

@Table
export default class Playlist extends Model<Playlist> {
  @PrimaryKey
  @Column
  public user: string;

  @Column({ type: DataType.TEXT, defaultValue: null })
  public list: string;
}
