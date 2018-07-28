/**
 * sails.config.routes
 */
module.exports.routes = {
  '/': {
    view: 'index',
  },
  '/game': {
    view: 'game',
    policy: 'isWorldBuilder',
  },
  '/static/dev/*': 'ProtectedFilesController.download',
};
