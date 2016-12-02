module.exports = function(DEVICE_KEY, EC2_URL, HEROKU_URL) {

    const Fetch = require('node-fetch');
    Fetch.Promise = require('bluebird');

    const getUrlBy = function(source) {
        switch(source) {
            case 'heroku':
                return HEROKU_URL + '/configuration/' + DEVICE_KEY;

            case 'ec2':
                return EC2_URL + '/configuration/' + DEVICE_KEY;

            default:
                console.error('Unidentified source');
                return null;
        }
    };

    return {
        getConfiguration: function(source) {
            return Fetch(getUrlBy(source))
                .then(function(response) {
                    return response.json();
                })
                .then(function(responseJson) {
                    return responseJson.rgbSequence ? responseJson.rgbSequence : '';
                })
                .then(function(rgbSequence) {
                    return rgbSequence ? rgbSequence.split('') : [];
                })
                .catch(function(error) {
                    console.error('Error', error);
                    return [];
                });
        }
    };
};