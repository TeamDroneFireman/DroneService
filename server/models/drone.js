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
  Drone.getByIntervention= function(id, callback) {
    Drone.find({ where: {intervention: id} }, function(err, drones) {
      callback(null, drones);
    })
  };

  Drone.remoteMethod(
    'getByIntervention',
    {
      http: {path: '/intervention/:id', verb: 'get'},
      accepts: {arg: 'id', type: 'number', required: true},
      returns: {type: 'array', root: true}
    }
  );

  //TODO add remote method missionCall
  /*
  Drone.afterRemote('mission', function(ctx, modelInstance, next) {
    // Model instance is the returned array
    if(Array.isArray(modelInstance)){
      console.log(" modelInstance is array");
      ctx.result.forEach(function(intervention){
        var temp = {};
        temp[intervention]=ctx.result[intervention];
        // Here creationDate is a field of my intervention adapt it mtfk !! :)
        console.log("   creationDate : " +intervention.creationDate);
      })
    }
    next();
  });
  */

  //TODO add sanitizing before methods

  //TODO add auth before methods

  //TODO add mission call after method missionCall

};
