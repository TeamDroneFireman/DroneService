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

  //TODO add sanitizing before methods

  //TODO add auth before methods
};
