module.exports = function(Drone) {

  const SIMULATOR_URL = './simulator/';

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
    * also declare an instance for simulator purpose
    */
   Drone.beforeRemote('create', function(ctx, unused, next){
     var model = ctx.args.data;
     var dPattern = new RegExp(/\d+$/);
    var hasNum = dPattern.test(model.name);
    if (!hasNum){
      var rePattern = new RegExp(/(.*?)\s*?(\d+)?$/);
      var str = model.name.replace(rePattern, '$1');
      Drone.count({intervention: model.intervention, name: {like: str} },
        function(err, res){
          model.name = model.name + ' ' + (res+1);

          //Simulator specific code
          Drone.count(function(err, res){
            model.instance = res+1;
            next();
          });
      });
    } else {
      //Simulator specific code
      Drone.count(function(err, res){
        model.instance = res+1;
        next();
      });
    }
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
    Drone.findById(id,
    function(err, drone){
      if(err) callback(err,{});
      var jsonfile = require('jsonfile');
      jsonfile.readFile(
      SIMULATOR_URL+'config.json',
      function(err, obj) {
        Drone.app.datasources.simulatorService
        .startMission(
        obj.flaskUrl,
        drone.id,
        drone.instance,
        mission,
        drone.intervention,
        function(err, res){
          callback(err,res);
        });
      });
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
    var model = ctx.args.data;
    var jsonfile = require('jsonfile');
    jsonfile.readFile(
    SIMULATOR_URL+'config.json',
    function(err, obj) {
    Drone.app.datasources.simulatorService
    .createDrone(obj.flaskUrl, model.instance, model.location,
      function(err, res){
        next(err,res);
      });
    });
  });

  Drone.getAskedDronesByIntervention = function (id,callback) {
    Drone.find({ where: {and: [{intervention: id}, {currentState: 'ASKED'}]} },
      function(err, drones) {
        callback(null, drones);
      });
  };

  Drone.remoteMethod('getAskedDronesByIntervention', {
      http: {path: '/intervention/:id/asked/', verb: 'get'},
      accepts: {arg: 'id', type: 'string', required: true},
      returns: {type: 'array', root: true}
    }
  );

  Drone.afterRemote('create',function (ctx, unused, next) {
    sendPushMessage(ctx.result, 'Drone/Create');
    next();
  });

  Drone.afterRemote('upsert',function (ctx, unused, next) {
    sendPushMessage(ctx.result, 'Drone/Update');
    next();
  });

  Drone.afterRemote('updateAll',function (ctx, unused, next) {
    sendPushMessage(ctx.result, 'Drone/Update');
    next();
  });

  Drone.afterRemote('deleteById',function (ctx, unused, next) {
    sendPushMessage(ctx.result, 'Drone/Delete');
    next();
  });
  function sendPushMessage(drone,topic){
    var pushMessage = {
      idIntervention : drone.intervention,
      idElement : drone.id,
      timestamp : Date.now(),
      topic : topic
    };
    var pushService = Drone.app.datasources.pushService;
    pushService.create(pushMessage, function(err,data){
      if (err) throw err;
      if (data.error)
        next('> response error: ' + err.error.stack);
    });
  }
};
