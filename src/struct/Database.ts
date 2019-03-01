import { Sequelize } from 'sequelize-typescript';
import Blacklist from './models/blacklist';
import Playlist from './models/playlist';

// @ts-ignore
export const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: __dirname + '/../../provider/ramiel.db',
  define: {
    freezeTableName: true,
    timestamps: true
  },
  logging: false,
  modelPaths: [ __dirname + '/models' ],
  operatorAliases: false,
  pool: {
    acquire: 30e3,
    max: 10,
    min: 0
  }
});

export const create = () => {
  return {
    sequelize,
    // @ts-ignore
    Op: Sequelize.Op,
    Playlist,
    Blacklist
  };
};
