import { Op } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import { db } from './../../auth';
import Blacklist from './models/Blacklist';
import Moderator from './models/Moderator';
import Playlist from './models/Playlist';
import Queue from './models/Queue';

export const sequelize = new Sequelize({
  dialect: 'mariadb',
  host: db.host,
  database: db.database,
  username: db.username,
  password: db.password,
  define: {
    freezeTableName: true,
    timestamps: true,
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci'
  },
  logging: false,
  modelPaths: [ __dirname + '/models' ],
  pool: {
    acquire: 30e3,
    max: 10,
    min: 0
  }
});

export const create = () => {
  return {
    sequelize,
    Op,
    Playlist,
    Blacklist,
    Moderator,
    Queue
  };
};
