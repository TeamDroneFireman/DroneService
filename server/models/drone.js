module.exports = function(Drone) {

  const DRONE_SCRIPTS_URL =
    '/home/kozhaa/Master2/project/DroneKit/mission_boucle.py';

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
      http: {path: '/intervention/:id', verb: 'get'},
      accepts: {arg: 'id', type: 'number', required: true},
      returns: {type: 'array', root: true}
    }
  );

  /**
   * set a new mission to the specified drone
   * @param id
   * @param mission
   * @param callback
     */
  Drone.setMission = function(id, mission, callback) {

    Drone.updateAll({'id' : id}, {'mission' : mission}, function(err, drone){
      // get drone state from update response
      // call mission manager in order to launch the mission
      // (initialize if needed, based on state)
      const spawn = require('child_process').spawn;
      var argts = [DRONE_SCRIPTS_URL, '--mission'];
      for(var point in mission.poi){
        argts.push(mission.poi[point].x);
        argts.push(mission.poi[point].y);
        argts.push(mission.poi[point].z);
      }
      const missionScript = spawn('python', argts);
      callback(null, drone);
    });
  };

  Drone.remoteMethod(
    'setMission',
    {
      http: {path: '/:id/mission/', verb: 'put'},
      accepts: [
        {arg: 'id', type: 'number', required: true},
        {arg: 'mission', type: 'object', http: {source: 'body'}}
      ],
      returns: {type: 'array', root: true}
    }
  );

  /***
   * auth required before all methods
   */
/*
  Drone.beforeRemote('*', function(ctx, unused, next) {
    Drone.app.datasources.UserService
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
  //TODO add sanitizing body obj before each methods
};
