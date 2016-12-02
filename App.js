// Configuration Injection
const DEVICE_KEY = process.env.DEVICE_KEY || 'robo-device';
const HEROKU_URL = process.env.HEROKU_URL || 'https://cloud-computing-project.herokuapp.com';
const EC2_URL = process.env.EC2_URL || 'http://ec2-54-93-110-255.eu-central-1.compute.amazonaws.com:8080';

const GET_CONFIG_DELAY_MS = 3 * 1000;
const BLINK_LOOP_DELAY_MS = 500;
const WAIT_IF_NO_RGB_DELAY_MS = 1 * 1000;

// Module Injection
const ConfigurationService = require('./app/ConfigurationService')(DEVICE_KEY, EC2_URL, HEROKU_URL);
const RoboticsService = require('./app/RoboticsService')(GET_CONFIG_DELAY_MS, BLINK_LOOP_DELAY_MS, WAIT_IF_NO_RGB_DELAY_MS);
const Promise = require('bluebird');

// Defining state - configuration
const configurationSources = [undefined, 'ec2', 'heroku'];
var configurationSource = undefined;

// Starting the robot
console.log('Please note: we are starting with an empty configuration!');
RoboticsService.startRobot(
    function() {
        // The configuration getter of the robot
        return ConfigurationService.getConfiguration(configurationSource)
    },
    function() {
        // The button click handler of the robot
        const removedConfigurationSource = configurationSources.shift();
        configurationSources.push(removedConfigurationSource);
        configurationSource = configurationSources[0];
        console.log('New configuration: ', configurationSource);
    });
