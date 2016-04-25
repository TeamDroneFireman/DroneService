module.exports = function(Drone) {
  // Removes (POST) /products
  Drone.disableRemoteMethod('create', true);
  // Removes (PUT) /products
  Drone.disableRemoteMethod('upsert', true);
  // Removes (DELETE) /products/:id
  Drone.disableRemoteMethod('deleteById', true);
  // Removes (POST) /products/update
  Drone.disableRemoteMethod('updateAll', true);
  // Removes (PUT) /products/:id
  Drone.disableRemoteMethod('updateAttributes', false);
  // removes (GET|POST) /products/change-stream
  Drone.disableRemoteMethod('createChangeStream', true);
};
