import { getWeatherData, oneCallApi } from "./fetchData.js";

const clearContainer = (container) => {
  container.forEach(c => c.remove());
};

const tempMethods = (() => {
  const checkTempActive = (btn) => {
    let unit;
    btn.forEach(span => {
      if (span.classList.contains('active')) {
        span.style.color = '#eb6f4c';
        if (span.innerText === '°C') unit = 'c';
        if (span.innerText === '°F') unit = 'f';
      }
      if (!span.classList.contains('active')) span.style.color = 'black';
    });
    return unit;
  };
  const changActive = (units) => {
    units.forEach(unit => unit.classList.toggle('active'));
    checkTempActive(units);
  };
  return {
    checkTempActive,
    changActive
  };
})();

//set the data in place
const setData = (res, divs) => {
  if (document.querySelectorAll('.right div')) {
    clearContainer(document.querySelectorAll('.right div'));
  }

  const setDailyData = (data) => {
    const body = document.querySelector('#daily-data .body');
    body.childNodes.forEach(c => c.remove());

    data.forEach(item => {
      let itemContainer = document.createElement('div');
      let img = document.createElement('img');
      let imgC = document.createElement('div');
      let day = document.createElement('div');
      let rain = document.createElement('div');
      let humidity = document.createElement('div');
      let temp = document.createElement('div');

      itemContainer.style.backgroundColor = 'rgb(0 0 0 / 0.3)';
      itemContainer.style.borderBottom = 'solid 1px rgb(0 0 0 / 0.2)';

      img.src = item.iconUrl;
      day.innerText = item.timeStamp;
      rain.innerText = item.rain;
      humidity.innerText = item.humidity;
      temp.innerText = `${item.hTemp}°  ||  ${item.lTemp}°`;
      imgC.append(img);
      body.append(itemContainer);
      itemContainer.append(day);
      itemContainer.append(imgC);
      itemContainer.append(rain);
      itemContainer.append(humidity);
      itemContainer.append(temp);
    });
  };

  const setNowData = (data) => {
    const todaySummary = document.querySelector('#today-forcast');
    const fullDayData = document.querySelectorAll('#full-day-data .t');
    todaySummary.innerText = `Today Forcast: ${data.weatherDescription}`;
    fullDayData.forEach(c => {
      if (c.innerText === 'SUNRISE:') {
        c.nextElementSibling.innerText = `${data.sunRise}`;
      }
      if (c.innerText === 'SUNSET:') {
        c.nextElementSibling.innerText = data.sunSet;
      }
      if (c.innerText === 'RAIN:') {
        c.nextElementSibling.innerText = `${data.rainOrSnow}`;
      }
      if (c.innerText === 'HUMIDITY:') {
        c.nextElementSibling.innerText = `${data.humodity}`;
      }
      if (c.innerText === 'WIND:') {
        c.nextElementSibling.innerText = data.windSpeed;
      }
      if (c.innerText === 'FEELS LIKE:') {
        c.nextElementSibling.innerText = data.feelsLike;
      }
      if (c.innerText === 'PRECIPITATION:') {
        c.nextElementSibling.innerText = data.Preciption;
      }
      if (c.innerText === 'PRESSURE:') {
        c.nextElementSibling.innerText = data.pressure;
      }
      if (c.innerText === 'VISIBILITY:') {
        c.nextElementSibling.innerText = data.visibility;
      }
      if (c.innerText === 'UV INDEX:') {
        c.nextElementSibling.innerText = data.uv;
      }
    });
  };

  const makeHourCard = (data, container) => {
    if (data.time > 12) data.time = data.time - 12;
    let div = document.createElement('div');
    let img = document.createElement('img');
    img.src = data.iconUrl;
    container.append(div);
    div.append(document.createElement('div').innerText = data.time);
    div.append(img);
    div.append(document.createElement('div').innerText = data.temp);
    div.style.display = 'flex';
    div.style.flexDirection = 'column';
    div.style.alignItems = 'center';
    div.style.justifyContent = 'center';
    div.style.backgroundColor = 'rgb(0 150 136 / 1)';
    div.style.fontSize = '20px';
    div.style.fontWeight = '900';

  };
  const tempUnitBtn = document.querySelectorAll('.c-or-f button span');
  const hourContainer = document.querySelector('.right');

  divs.forEach(div => {
    if (div.classList.contains('name')) div.innerText = res.cityName;
    if (div.classList.contains('weather')) div.innerText = res.weatherMain;
    if (div.classList.contains('temp')) div.innerText = Math.floor(res.temprature.now) + '°';
    if (div.classList.contains('h')) div.innerText = 'H : ' + Math.floor(res.temprature.max) + '°';
    if (div.classList.contains('l')) div.innerText = 'L : ' + Math.floor(res.temprature.min) + '°';
  });

  //call api to get full cast data

  oneCallApi(res.lat, res.lng, tempMethods.checkTempActive(tempUnitBtn)).then(respond => {
    setNowData(respond.nowDataOpject);
    setDailyData(respond.dailyArray);
    respond.hourArray.forEach(h => makeHourCard(h, hourContainer));
  });

};

const main = (() => {
  let city = 'New York';
  const tempUnitBtn = document.querySelectorAll('.c-or-f button span');
  const tempBtn = document.querySelector('.c-or-f button');
  const allDivs = document.querySelectorAll('#top-main-container .left div');
  tempMethods.checkTempActive(tempUnitBtn);

  tempBtn.addEventListener('click', () => {
    tempMethods.changActive(tempUnitBtn);
    weatherData(city).then(res => setData(res, allDivs))
      .catch(error => console.error('Error in fetching Data, see your conection'));
  });

  let weatherData = (city) => {
    return getWeatherData(tempMethods.checkTempActive(tempUnitBtn),
      city);
  };
  weatherData(city).then(res => setData(res, allDivs))
    .catch(error => console.error('Error in fetching Data, see your conection'));

  const takeSearchValue = (searchInput) => {
    if (searchInput.value === '') return;
    city = searchInput.value.slice(0, 1).toUpperCase() + searchInput.value.slice(1).toLowerCase();
    weatherData(city).then(res => setData(res, allDivs))
      .catch(error => console.error('Error in fetching Data, see your conection'));

  };
  const searchInput = document.querySelector('header input');
  const searchBtn = document.querySelector('header .search-btn');
  searchBtn.addEventListener('click', () => takeSearchValue(searchInput));
  searchInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') takeSearchValue(e.target);
  });





})();

const goToGitHupFunc = (() => {
  const gitHupIcon = document.querySelector('.footer i');

  gitHupIcon.addEventListener('click', () => {
    const url = 'https://github.com/u31999';
    window.open(url, '_blank');
  });

})();
