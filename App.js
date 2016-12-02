// Configuration Injection
const DEVICE_KEY = process.env.DEVICE_KEY || 'robo-device';
const EC2_URL = process.env.EC2_URL || 'https://cloud-computing-project.herokuapp.com';
const HEROKU_URL = process.env.HEROKU_URL || 'http://ec2-54-93-110-255.eu-central-1.compute.amazonaws.com:8080';


// Module Injection
const ConfigurationService = require('./app/ConfigurationService')(DEVICE_KEY, EC2_URL, HEROKU_URL);
const RoboticsService = require('./app/RoboticsService')();
const Promise = require('bluebird');


// Starting the robotics
var configurationSource = 'ec2';

const toggleConfigurationSource = function() {
    configurationSource = configurationSource == 'ec2' ? 'heroku' : 'ec2';
    console.log('New configuration: ', configurationSource);
};

const configurationGetter = function() {
    return ConfigurationService.getConfiguration(configurationSource)
};

RoboticsService.startRobot(configurationGetter, toggleConfigurationSource);
