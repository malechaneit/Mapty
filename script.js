'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

// Data classes

class Workout {
  date = new Date();
  id = (Date.now() + '').slice(-10);
  constructor(coords, distance, duration) {
    this.coords = coords; // [lat, lgt]
    this.distance = distance; // km
    this.duration = duration; // m
  }
}

class Running extends Workout {
  type = 'running';
  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.calcPace();
  }

  calcPace() {
    cd;
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}

class Cycling extends Workout {
  type = 'cycling';
  constructor(coords, distance, duration, type, elevationGain) {
    super(coords, distance, duration);

    this.elevationGain = elevationGain;
    this.calcSpeed();
  }

  calcSpeed() {
    this.speed = this.distance / this.duration;
    return this.speed;
  }
}

//////////////////////////////
// App Architecture
class App {
  #map;
  #mapEvent;
  #workouts = [];

  constructor() {
    this._getPosition();

    form.addEventListener('submit', this._newWorkout.bind(this));
    inputType.addEventListener('change', this._toggleelevationField);
  }

  _getPosition() {
    navigator.geolocation &&
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function () {
          alert('Could not get the location');
        }
      );
  }

  _loadMap(position) {
    const { longitude } = position.coords;
    const { latitude } = position.coords;

    const coords = [latitude, longitude];

    this.#map = L.map('map').setView(coords, 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    this.#map.on('click', this._showForm.bind(this));
  }

  _showForm(mapE) {
    this.#mapEvent = mapE;
    form.classList.remove('hidden');
    inputDistance.focus();
  }

  _toggleelevationField() {
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
  }

  _newWorkout(e) {
    e.preventDefault();

    // Helpers
    const valideInput = (...inputs) =>
      inputs.every(inp => Number.isFinite(inp));

    const isPositive = (...inputs) => inputs.every(inp => inp > 0);

    // Get data from form
    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;

    const { lat, lng } = this.#mapEvent.latlng;
    let workout;

    // Check if data is valid

    // If workout is running create Runnng object
    if (type === 'running') {
      const cadence = +inputCadence.value;

      if (
        !valideInput(distance, duration, cadence) ||
        !isPositive(distance, duration, cadence)
      )
        return alert('Data should be a positive number.');

      workout = new Running([lat, lng], distance, duration, cadence);
    }

    // If workout is cycling create Cycling object
    if (type === 'cycling') {
      const elevation = +inputElevation.value;

      if (
        !valideInput(distance, duration, elevation) ||
        !isPositive(distance, duration)
      )
        return alert('Data should be a positive number.');

      workout = new Cycling([lat, lng], distance, duration, elevation);
    }

    // Add new object to workouts array
    this.#workouts.push(workout);
    console.log(workout);

    // Render workout on map as a marker

    // Render workout on a list
    this.renderWorkoutMarker(workout);

    // Hide all values
    inputDistance.value =
      inputCadence.value =
      inputDuration.value =
      inputElevation.value =
        '';
  }

  renderWorkoutMarker(workout) {
    L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          maxHeight: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`,
        })
      )
      .setPopupContent('Workout')
      .openPopup();
  }
}

const app = new App();
