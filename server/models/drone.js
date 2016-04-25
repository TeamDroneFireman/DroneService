module.exports = function(Drone) {
  
  // Removes (DELETE) /products/:id
  Drone.disableRemoteMethod('deleteById', true);
  // Removes (POST) /products/update
  Drone.disableRemoteMethod('updateAll', true);
  // Removes (PUT) /products/:id
  Drone.disableRemoteMethod('updateAttributes', false);
  // removes (GET|POST) /products/change-stream
  Drone.disableRemoteMethod('createChangeStream', true);
};
