const getWeatherData = async (unit, city) => {
    let weatherMain, iconUrl, cityName, u;
    let lng, lat;
    let temprature = { now: '', max: '', min: '' };
    if (unit === 'c') u = 'metric';
    if (unit === 'f') u = 'imperial';

    let geticonUrl = (ic) => {
        let res = `https://openweathermap.org/img/wn/${ic}@2x.png`;
        return res;
    };
    const fetchUrl = await fetch(`http://api.openweathermap.org/data/2.5/weather?q=${city}&units=${u}&appid=ac4c1552606cb8979d2cd3fcc345d612`,
        { mode: 'cors' });
    const urlJson = await fetchUrl.json();

    weatherMain = urlJson.weather[0].main;
    iconUrl = geticonUrl(urlJson.weather[0].icon);
    temprature.now = urlJson.main.temp;
    temprature.max = urlJson.main.temp_max;
    temprature.min = urlJson.main.temp_min;
    cityName = urlJson.name;
    lat = urlJson.coord.lat;
    lng = urlJson.coord.lon;

    return {
        weatherMain,
        temprature,
        iconUrl,
        cityName,
        lng,
        lat
    };


};

const HourData = class {
    constructor(time, iconUrl, temp) {
        this.time = time;
        this.iconUrl = `https://openweathermap.org/img/wn/${iconUrl}@2x.png`;
        this.temp = Math.floor(temp);
    }
};

const DailyData = class {
    constructor(timeStamp, iconUrl, rain, humidity, hTemp, lTemp) {
        this.timeStamp = timeStamp;
        this.iconUrl = `https://openweathermap.org/img/wn/${iconUrl}@2x.png`;
        this.rain = rain;
        this.humidity = humidity;
        this.hTemp = hTemp;
        this.lTemp = lTemp;
    }
};

const oneCallApi = async (lat, lon, unit) => {

    const changeToHour = (timeStamp) => {
        let date = new Date(timeStamp * 1000);
        return date.getHours();
    };
    const getfullTime = (timeStamp) => {
        const pad = num => ("0" + num).slice(-2);
        let date = new Date(timeStamp * 1000);
        let hours = date.getHours();
        let minutes = date.getMinutes();
        return pad(hours) + ':' + pad(minutes);
    };
    const getDayofWeek = (timestamp) => {
        let date = new Date(timestamp * 1000);
        let days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return days[date.getDay()];
    };

    const Preciption = (daily) => {
        return daily[0].pop;
    };
    const findRainOrSnow = (daily) => {
        let res;
        res = daily.rain;
        if (res === undefined) res = daily.snow + ' snow';
        if (res === 'undefined snow') res = '0';
        return res;
    };

    let u;
    let hourArray = [];
    let dailyArray = [];
    let nowDataOpject;

    if (unit === 'c') u = 'metric';
    if (unit === 'f') u = 'imperial';

    let response = await fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&units=${u}&appid=ac4c1552606cb8979d2cd3fcc345d612`,
        { mode: 'cors' });
    let reponseJson = await response.json();

    nowData(reponseJson.current, reponseJson.daily);
    hourlyData(reponseJson.hourly);
    dailyData(reponseJson.daily);

    function nowData(data, dailyData) {
        nowDataOpject = {
            Preciption: `${Preciption(dailyData)}` + ' cm',
            timeNow: changeToHour(data.dt),
            sunRise: getfullTime(data.sunrise),
            sunSet: getfullTime(data.sunset),
            humodity: data.humidity + '%',
            pressure: data.pressure + ' hPa',
            weatherDescription: data.weather[0].description,
            clouds: data.clouds,
            feelsLike: data.feels_like + '°',
            uv: data.uvi,
            windSpeed: data.wind_speed + ' km/hr',
            visibility: (data.visibility / 100) + ' km',
            rainOrSnow: findRainOrSnow(dailyData[0]),
        };

    }

    function hourlyData(data) {
        for (let i = 0; i <= 23; i++) {
            hourArray.push(new HourData(changeToHour(data[i].dt),
                data[i].weather[0].icon, data[i].temp));
        }

    }
    function dailyData(data) {

        const highLowTemp = (temp) => {
            let h, l;
            let values = [...Object.values(temp)];
            let sValues = values.sort((a, b) => b > a ? 1 : -1);
            h = sValues[sValues.length - 1];
            l = sValues[0];
            return {
                h,
                l
            };
        };
        data.forEach(d => {
            dailyArray.push(new DailyData(
                getDayofWeek(d.dt),
                d.weather[0].icon,
                findRainOrSnow(d),
                d.humidity,
                highLowTemp(d.temp).h,
                highLowTemp(d.temp).l,
            ));
        });
        dailyArray.shift();
    }

    return {
        hourArray,
        nowDataOpject,
        dailyArray
    };

};

export { getWeatherData, oneCallApi };


