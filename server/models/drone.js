module.exports = function(Drone) {

  const SIMULATOR_URL = '../../simulator/';

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
      accepts: {arg: 'id', type: 'string', required: true},
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
      const spawn = require('child_process').spawn;

      //TODO fuse scripts mission_boucle and mission_segment in py scripts
      var argts = [SIMULATOR_URL + 'mission_segment.py', '--mission'];
      for(var point in mission.poi){
        argts.push(mission.poi[point].x);
        argts.push(mission.poi[point].y);
        argts.push(mission.poi[point].z);
      }
      //TODO add area mission handling

      const missionScript = spawn('python', argts);
      callback(null, drone);
    });
  };

  Drone.remoteMethod(
    'setMission',
    {
      http: {path: '/:id/mission/', verb: 'put'},
      accepts: [
        {arg: 'id', type: 'string', required: true},
        {arg: 'mission', type: 'object', http: {source: 'body'}}
      ],
      returns: {type: 'array', root: true}
    }
  );

  /***
  * start simulator in case of document creation
  */
  Drone.beforeRemote(
   'create',
   function(ctx, unused, next){
     const spawn = require('child_process').spawn;
     var argts = [
       ctx.req.body.location.geopoint.latitude,
       ctx.req.body.location.geopoint.longitude,
       ctx.req.body.location.geopoint.altitude,
       ctx.req.body.id
     ];
     const missionScript =
      spawn(SIMULATOR_URL + 'add_drone_simulator.sh', argts, {'shell':true});
     next();
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
};
