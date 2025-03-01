/**
 * @fileOverview
 * @author Jihoon Lee - jihoonlee.in@gmail.com
 * @author Russell Toris - rctoris@wpi.edu
 */

/**
 * A URDF client can be used to load a URDF and its associated models into a 3D object from the ROS
 * parameter server.
 *
 * Emits the following events:
 *
 * * 'change' - emited after the URDF and its meshes have been loaded into the root object
 *
 * @constructor
 * @param options - object with following keys:
 *
 *   * ros - the ROSLIB.Ros connection handle
 *   * param (optional) - the paramter to load the URDF from, like 'robot_description'
 *   * tfClient - the TF client handle to use
 *   * path (optional) - the base path to the associated Collada models that will be loaded
 *   * rootObject (optional) - the root object to add this marker to
 *   * tfPrefix (optional) - the TF prefix to used for multi-robots
 *   * loader (optional) - the Collada loader to use (e.g., an instance of ROS3D.COLLADA_LOADER)
 */
ROS3D.UrdfClient = function(options) {
  options = options || {};
  this.ros = options.ros;
  this.topicName = options.param || 'robot_description';
  this.path = options.path || '/';
  this.tfClient = options.tfClient;
  this.rootObject = options.rootObject || new THREE.Object3D();
  this.tfPrefix = options.tfPrefix || '';
  this.loader = options.loader;
  
  this.rosTopic = undefined;
  this.urdf = undefined;
  this.processMessageBound = this.processMessage.bind(this);

  this.subscribe();
};

ROS3D.UrdfClient.prototype.__proto__ = THREE.Object3D.prototype;


ROS3D.UrdfClient.prototype.unsubscribe = function(){
  if(this.rosTopic){
    this.rosTopic.unsubscribe(this.processMessage.bind(this));
  }
};

ROS3D.UrdfClient.prototype.subscribe = function(){
  this.unsubscribe();

  // subscribe to the topic
  this.rosTopic = new ROSLIB.Topic({
    ros: this.ros,
    name: this.topicName,
    queue_length: 1,
    messageType: 'std_msgs/String',
  });
  this.rosTopic.subscribe(this.processMessage.bind(this));
};

ROS3D.UrdfClient.prototype.processMessage = function(message){
  var urdfModel = new ROSLIB.UrdfModel({
    string: message.data,
  });

  this.urdf = new ROS3D.Urdf({
    urdfModel: urdfModel,
    path: this.path,
    tfClient: this.tfClient,
    tfPrefix: this.tfPrefix,
    loader: this.loader,
  });
  this.rootObject.add(this.urdf);
  this.rosTopic.unsubscribe(this.processMessageBound);
};
