module.exports = function(GET_CONFIG_DELAY_MS, BLINK_LOOP_DELAY_MS, WAIT_IF_NO_RGB_DELAY_MS) {

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
                robot[key].digitalWrite(on ? 1 : 0);
            }
        }
    };

    const delay = function(time) {

        return new Promise(function(fulfill) {
            setTimeout(fulfill, time);
        });
    };

    const startInfiniteRgbSequenceBlinking = function(robot, getRgbSequenceFn) {

        const immutableRgbSequence = [].concat(getRgbSequenceFn());

        // If there's no configuration, wait a little before trying again
        if (immutableRgbSequence.length === 0) {
            
            delay(WAIT_IF_NO_RGB_DELAY_MS)
                .done(function() {
                    console.log('Waiting for RGB sequence...');
                    startInfiniteRgbSequenceBlinking(robot, getRgbSequenceFn); 
                });

        } else {

            console.log('STARTED Blinking:', immutableRgbSequence);

            var currentRgbSequenceId = 0;
            var ledsOn = false;

            const processBlinking = function() {
                if (currentRgbSequenceId == immutableRgbSequence.length) {
                    console.log('STOPPED Blinking:', immutableRgbSequence);
                    startInfiniteRgbSequenceBlinking(robot, getRgbSequenceFn);
                    return;
                }
                
                const currentColor = immutableRgbSequence[currentRgbSequenceId];

                if (ledsOn) {
                    currentRgbSequenceId++;
                    switchColor(false, currentColor, robot);
                    ledsOn = false;

                } else {
                    switchColor(true, currentColor, robot)
                    ledsOn = true;
                }

                delay(BLINK_LOOP_DELAY_MS).done(processBlinking);
            };

            processBlinking();
        }
    };
    
    const startInfiniteConfigurationRetrieval = function(robot, configurationPromise, setRgbSequenceFn) {
        
        configurationPromise()
            .then(function(configuration) {
                setRgbSequenceFn(configuration);
                delay(GET_CONFIG_DELAY_MS)
                    .done(function() {
                        startInfiniteConfigurationRetrieval(robot, configurationPromise, setRgbSequenceFn)
                    });
            });
    };

    const initializeRobotWorker = function(configurationPromise, onButtonClick) {
        
        return function(robot) {

            robot.button.on('push', onButtonClick);

            var rgbSequence = [];
            
            startInfiniteConfigurationRetrieval(robot, configurationPromise, function(newRgbSequence) {
                rgbSequence = newRgbSequence;
            });

            startInfiniteRgbSequenceBlinking(robot, function() {
                return rgbSequence;
            });
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