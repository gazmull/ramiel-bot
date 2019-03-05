import { Column, DataType, Length, Model, Table } from 'sequelize-typescript';
import { Song } from '../../../typings';

const random = () => `My_Playlist_${Math.random().toString(36).substr(2, 16)}`;

@Table({ tableName: 'playlist' })
export default class Playlist extends Model<Playlist> {
  @Column({ type: DataType.STRING({ length: 32 }) })
  public user: string;

  @Length({ min: 3, max: 48, msg: 'Allowed name length is only between 3 and 48 characters.' })
  @Column({ defaultValue: random })
  public name: string;

  @Column({
    type: DataType.TEXT,
    defaultValue: null,
    get () {
      return JSON.parse(this.getDataValue('list'));
    },
    set (value) {
      return this.setDataValue('list', JSON.stringify(value));
    }
  })
  public list: Song[];
}
