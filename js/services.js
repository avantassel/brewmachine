brewBench.factory('BrewService', function($http, $q, $filter){

  return {

    //cookies size 4096 bytes
    settings: function(key,values){
          if(!window.localStorage)
            return values;
          try {
            if(values)
              return window.localStorage.setItem(key,JSON.stringify(values));
            else if(window.localStorage.getItem(key))
              return JSON.parse(window.localStorage.getItem(key));
          } catch(e){
            /*JSON parse error*/
          }
          return values;
    },

    byteCount: function(s) {
      return encodeURI(s).split(/%..|./).length - 1;
    },

    domain: function(){
      var settings = this.settings('settings');

      if(settings && settings.arduinoUrl)
        return settings.arduinoUrl;
      else if(document.location.host == 'localhost')
        return 'http://arduino.local';
      return '';
    },
    // read/write thermistors
    // https://learn.adafruit.com/thermistor/using-a-thermistor
    temp: function(sensor,value){
      var q = $q.defer();
      var url = this.domain()+'/arduino/analog/'+sensor;
      if(value)
        url += '/'+value;

      $http.get(url,{timeout:10000}).then(function(response){
        q.resolve(response.data);
      },function(err){
        q.reject(err);
      });
      return q.promise;
    },
    // read/write heater
    // http://arduinotronics.blogspot.com/2013/01/working-with-sainsmart-5v-relay-board.html
    heat: function(sensor,value){
      var q = $q.defer();
      var url = this.domain()+'/arduino/digital/'+sensor;
      if(value)
        url += '/'+value;

      $http.get(url,{timeout:10000}).then(function(response){
        q.resolve(response.data);
      },function(err){
        q.reject(err);
      });
      return q.promise;
    },

    blink: function(pin){
      var q = $q.defer();
      $http.get(this.domain()+'/arduino/blink/'+pin+'/output',{timeout:10000}).then(function(response){
        q.resolve(response.data);
      },function(err){
        q.reject(err);
      });
      return q.promise;
    },

    chartOptions: function(){
      return {
        chart: {
              type: 'lineChart',
              noData: 'Press play on a kettle to start graphing.',
              height: 450,
              margin : {
                  top: 20,
                  right: 20,
                  bottom: 100,
                  left: 65
              },
              x: function(d){ return d[0]; },
              y: function(d){ return d[1]; },
              // average: function(d) { return d.mean },

              color: d3.scale.category10().range(),
              duration: 300,
              useInteractiveGuideline: true,
              clipVoronoi: false,

              xAxis: {
                  axisLabel: 'Time',
                  tickFormat: function(d) {
                      return d3.time.format('%I:%M:%S')(new Date(d))
                  },
                  orient: 'bottom',
                  tickPadding: 20,
                  axisLabelDistance: 40,
                  staggerLabels: true
              },
              forceY: [0,220],
              yAxis: {
                  axisLabel: 'Temperature',
                  tickFormat: function(d){
                      return d;
                  },
                  orient: 'left',
                  showMaxMin: true,
                  axisLabelDistance: 0
              }
          }
        };
    }
  };
});
