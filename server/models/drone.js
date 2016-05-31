module.exports = function(Drone) {

  const SIMULATOR_URL = '../../simulator/';

  Drone.disableRemoteMethod('deleteById', true);
  Drone.disableRemoteMethod('updateAll', true);
  Drone.disableRemoteMethod('createChangeStream', true);

  /***
   * auth required before all methods
   */
   /*
   Intervention.beforeRemote('*', function(ctx, unused, next) {
     Intervention.app.datasources.userService
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


   /**
    * save the drone with a numbered name
    * each number is specific for a name and intervention
    */
   Drone.beforeRemote('create', function(ctx, unused, next){
     var model = ctx.args.data;
     var rePattern = new RegExp(/(.*?)\s*?(\d+)?$/);
     var str = model.name.replace(rePattern, '$1');
     Drone.count({intervention: model.intervention, name: {like: str} },
       function(err, res){
         model.name = model.name + ' ' + (res+1);
         next();
     });
   });

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
      description: 'find drones by intervention',
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
    Drone.updateAll(
    {'id' : id},
    {'mission' : mission},
    function(err, drone){
      const spawn = require('child_process').spawn;
      var argts = [SIMULATOR_URL + 'mission.py', '--mission'];
      for(var point in mission.geopoints){
        argts.push(mission.geopoints[point].latitude);
        argts.push(mission.geopoints[point].longitude);
        argts.push(mission.geopoints[point].altitude);
      }
      //TODO add area mission handling

      const missionScript = spawn('python', argts);
      callback(null, drone);
    });
  };

  Drone.remoteMethod(
    'setMission',
    {
      description: 'Set a mission for the drone passed as parameter',
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
  Drone.afterRemote(
   'create',
   function(ctx, unused, next){
     const spawn = require('child_process').spawn;
     var argts = [
       'copter',
       '--home=',
       ctx.req.body.location.geopoint.latitude+','+
       ctx.req.body.location.geopoint.longitude+','+
       ctx.req.body.location.geopoint.altitude+',1',
       '--intance=',
       ctx.req.body.id
     ];
     const missionScript = spawn('dronekit-sitl', argts);
     console.log(argts);
     next();
   }
  );

  Drone.getAskedDronesByIntervention = function (id,callback) {
    Drone.find({ where: {and: [{intervention: id}, {currentState: 'ASKED'}]} },
      function(err, drones) {
        console.log(drones);
        callback(null, drones);
      });
  };

  Drone.remoteMethod('getAskedDronesByIntervention', {
      http: {path: '/intervention/:id/asked/', verb: 'get'},
      accepts: {arg: 'id', type: 'string', required: true},
      returns: {type: 'array', root: true}
    }
  );

  /***
  * Send push in case of document creation

  Drone.afterRemote(
    'create',
    function(ctx, unused, next){
      var topic = 'Drone/Create';
      Drone.app.datasources.interventionService
      .push(ctx.res.body.intervention,
        ctx.req.body.id,
        topic,
        function (err, response) {
        if (err || response.error) {
          next(err);
        } else {
          next();
        }
      });
    });

  /***
  * Send push in case of document modification
  * Do not track while on a mission.

  Drone.afterRemote(
    'updateAll',
    function(ctx, unused, next){

      var topic = 'Drone/Update';

      //check that the drone is not on a mission or released
      if(ctx.res.body.mission!=null || ctx.res.body.states.released!=null){
        next();
      }

      Drone.app.datasources.interventionService
      .push(ctx.res.body.intervention,
        ctx.res.body.id,
        topic,
        function (err, response) {
          if (err || response.error) {
            next(err);
          } else {
            next();
          }
        });
      }
    );

  /***
  * Send push in case of drone deletion

  Drone.beforeRemote(
    'updateAll',
    function(ctx, unused, next){
      var topic = 'Drone/Delete';
      Drone.findById(ctx.req.body.id,{fields:{states:true}},
        function(err,response){
          if (err || response.error){
            next(err);
          }else{
            if (ctx.req.body.states.released != null &&
            response.states.released == null){
              Drone.app.datasources.interventionService
              .push(ctx.res.body.intervention,
              ctx.res.body.id,
              topic,
              function (err, response) {
                if (err || response.error) {
                  next(err);
                } else {
                  next();
                }
              });
            }
          }
        }
      );
    }
  );

  /***
  * Send push in case of new mission setted for this drone

  Drone.afterRemote(
    'setMission',
    function(ctx, unused, next){
      var topic = 'Drone/Mission';
      Drone.app.datasources.interventionService.push(
      ctx.res.body.intervention,
      ctx.res.body.id,
      topic,
      function (err, response) {
        if (err || response.error) {
          next(err);
        } else {
          next();
        }
      });
      next();
    }
  );
  */
};
