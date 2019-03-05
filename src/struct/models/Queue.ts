import { Column, DataType, Model, PrimaryKey, Table, Unique } from 'sequelize-typescript';
import { Song } from '../../../typings';

@Table({ tableName: 'queues' })
export default class Queue extends Model<Queue> {
  @PrimaryKey
  @Column({ type: DataType.STRING({ length: 32 }) })
  public guild: string;

  @Unique
  @Column({ type: DataType.STRING({ length: 32 }) })
  public channel: string;

  @Column({
    type: DataType.TEXT,
    defaultValue: null,
    get () {
      return JSON.parse(this.getDataValue('textChannel'));
    },
    set (value) {
      return this.setDataValue('textChannel', JSON.stringify(value));
    }
  })
  public textChannel: {
    id: string;
    message: string;
  };

  @Column
  public host: string;

  @Column({ type: DataType.STRING({ length: 32 }) })
  public user: string;

  @Column({
    type: DataType.TEXT,
    defaultValue: null,
    get () {
      return JSON.parse(this.getDataValue('current'));
    },
    set (value) {
      return this.setDataValue('current', JSON.stringify(value));
    }
  })
  public current?: Song;

  @Column({
    type: DataType.TEXT,
    defaultValue: null,
    get () {
      return JSON.parse(this.getDataValue('tracks'));
    },
    set (value) {
      return this.setDataValue('tracks', JSON.stringify(value));
    }
  })
  public tracks: Song[];
}
