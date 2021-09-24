const request = require('request');

const fetchMyIP = function(callback) {
  request('https://api64.ipify.org/?format=json', (error, response, body) => {
    if (error) {
      return callback(Error, null);
    }
    if (response.statusCode !== 200) {
      callback(Error(`Error Code ${response.statusCode} when fetching IP: ${body}`), null);
      return;
    }
    const ip = JSON.parse(body).ip;
    callback(null, ip);
  });
};

const fetchCoordsByIP = function(ip, callback) {
  request(`https://freegeoip.app/json/${ip}`, (error, response, body) => {
    if (error) {
      callback(Error, null);
      return;
    }

    if (response.statusCode !== 200) {
      callback(Error(`Error Code ${response.statusCode} when fetching coordinates for IP: ${body}`), null);
      return;
    }

    const { latitude, longitude } = JSON.parse(body);

    callback(null, { latitude, longitude });
  });
};

const fetchISSFlyOverTimes = function(coordinates, callback) {
  request(`https://iss-pass.herokuapp.com/json/?lat=${coordinates.latitude}&lon=${coordinates.longitude}`, (error, response, body) => {
    if (error) {
      callback(Error, null);
      return;
    }

    if (response.statusCode !== 200) {
      callback(Error(`Error Code ${response.statusCode} when fetching ISS pass times: ${body}`), null);
      return;
    }

    const ISSPass = JSON.parse(body).response;
    callback(null, ISSPass);
  });
};

const nextISSTimesForMyLocation = function (callback) {
  fetchMyIP((error, ip) => {
    if (error) {
      return callback(Error, null);
    }

    fetchCoordsByIP(ip, (error, loc) => {
      if (error) {
        return callback(error, null);
      }

      fetchISSFlyOverTimes(loc, (error, nextPasses) => {
        if(error) {
          return callback(error, null);
        }

        callback(null, nextPasses);
      });
    });
  });
};

module.exports = { nextISSTimesForMyLocation };


