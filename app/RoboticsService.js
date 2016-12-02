module.exports = function() {

    const Cylon = require('cylon');
    const Promise = require('bluebird');

    const CONNECTIONS = {
        raspi: { adaptor: 'raspi' },
    };

    const DEVICES = {      
        button: { driver: 'button', pin: 18 },

        pinR0: { driver: 'direct-pin', pin: 32 },
        pinG0: { driver: 'direct-pin', pin: 16 },
        pinB0: { driver: 'direct-pin', pin: 12 },

        pinR1: { driver: 'direct-pin', pin: 40 },
        pinG1: { driver: 'direct-pin', pin: 38 },
        pinB1: { driver: 'direct-pin', pin: 36 },

        pinR2: { driver: 'direct-pin', pin: 37 },
        pinG2: { driver: 'direct-pin', pin: 35 },
        pinB2: { driver: 'direct-pin', pin: 33 },

        pinR3: { driver: 'direct-pin', pin: 23 },
        pinG3: { driver: 'direct-pin', pin: 21 },
        pinB3: { driver: 'direct-pin', pin: 19 },

        pinR4: { driver: 'direct-pin', pin: 15 },
        pinG4: { driver: 'direct-pin', pin: 13 },
        pinB4: { driver: 'direct-pin', pin: 11 }
    };

    const switchColor = function(on, colorLetter, robot) {
        const devicePrefix = 'pin' + colorLetter.toUpperCase();
        for (var key in robot) {
            if (key.indexOf(devicePrefix) > -1) {
                console.log(key);
                robot[key].digitalWrite(on ? 1 : 0);
            }
        }
    };

    const delay = function(time) {
        return new Promise(function(fulfill) {
            setTimeout(fulfill, time);
        });
    };

    const initializeRobotWorker = function(configurationPromise, onButtonClick) {
        return function(robot) {

            var rgbSequence = [];

            // Adding button click handler
            robot.button.on('push', function() {
                onButtonClick();
            });

            // Initiating infinite rgb sequence receiving
            const startInfiniteConfigurationRetrieval = function() {
                configurationPromise()
                    .then(function(configuration) {
                        rgbSequence = configuration;
                        startInfiniteConfigurationRetrieval();
                    });
            };

            startInfiniteConfigurationRetrieval();

            // Initiate infinite RGB blinking
            const startInfiniteRgbSequenceBlinking = function() {

                const immutableRgbSequence = [].concat(rgbSequence);

                // If there's no configuration, wait a little before trying again
                if (immutableRgbSequence.length === 0) {
                    delay(2 * 1000).done(startInfiniteRgbSequenceBlinking);
                    return;
                }

                // TODO: blinking
            };

            startInfiniteRgbSequenceBlinking();
        };
    };

    return {

        startRobot: function(configurationPromise, onButtonClick) {
            Cylon.robot({
                connections: CONNECTIONS,
                devices: DEVICES,
                work: initializeRobotWorker(configurationPromise, onButtonClick)
            }).start();
        }
    };
};