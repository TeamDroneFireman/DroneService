module.exports = function(Drone) {
Drone.disableRemoteMethod('create', true);                // Removes (POST) /products
Drone.disableRemoteMethod('upsert', true);                // Removes (PUT) /products
Drone.disableRemoteMethod('deleteById', true);            // Removes (DELETE) /products/:id
Drone.disableRemoteMethod("updateAll", true);               // Removes (POST) /products/update
Drone.disableRemoteMethod("updateAttributes", false);       // Removes (PUT) /products/:id
Drone.disableRemoteMethod('createChangeStream', true);    // removes (GET|POST) /products/change-stream
};
