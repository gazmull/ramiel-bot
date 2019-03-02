import * as config from '../auth';
import RamielClient from './struct/RamielClient';

const client = new RamielClient(config);

client
  .build()
  .init()
  .catch(err => client.logger.error(err));

client
  .on('disconnect', inf => { client.logger.warn(inf); process.exit(0); })
  .on('error', err => client.logger.error(err))
  .on('warn', inf => client.logger.warn(inf));

process.on('unhandledRejection', err => client.logger.error(err));
