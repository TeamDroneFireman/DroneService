module.exports = function(Drone) {

  // Removes (DELETE) /products/:id
  Drone.disableRemoteMethod('deleteById', true);
  // Removes (POST) /products/update
  Drone.disableRemoteMethod('updateAll', true);
  // removes (GET|POST) /products/change-stream
  Drone.disableRemoteMethod('createChangeStream', true);


  /**
   * return all the drones used in the intervention passed as parameter
   * @param id
   * @param callback
     */
  Drone.getByIntervention = function(id, callback) {
    Drone.find({ where: {intervention: id} }, function(err, drones) {
      callback(null, drones);
    });
  };

  Drone.remoteMethod(
    'getByIntervention',
    {
      http: {path: '/idIntervention/:id', verb: 'get'},
      accepts: {arg: 'id', type: 'number', required: true},
      returns: {type: 'array', root: true}
    }
  );

  //TODO add remote method missionCall
  Drone.setMission = function(id, callback) {

  };

  Drone.remoteMethod(
    'setMission',
    {
      http: {path: '/:id/mission/', verb: 'put'},
      accepts: {arg: 'mission', type: 'object', http: {source: 'body'}},
      returns: {type: 'array', root: true}
    }
  );

  //TODO add sanitizing before methods

/*
  Drone.beforeRemote('*', function(ctx, unused, next) {
    Drone.app.datasources.auth
      .checkAuth(ctx.req.headers.userid, ctx.req.headers.token,
        function (err, response) {
          if (err || response.error || response.id !== ctx.req.headers.token) {
            var e = new Error('You must be logged in to access database');
            e.status = 401;
            next(e);
          } else {
            next();
          }
        });
  });
*/
};
