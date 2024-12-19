window.onload = () => {
  const textBox = document.getElementById("text-box");
  const playButton = document.getElementById("play-button");
  const updateCityButton = document.getElementById("update-city");
  const provinceSelector = document.getElementById("province-selector");
  const citySelector = document.getElementById("city-selector");
  const apiKey = '670193bd-a9c5-438d-98d3-be0c7a4c9cd5'; // Tu clave API de IQAir
  const pais = 'Spain'; // País
  const estadoInicial = 'Madrid'; // Estado inicial por defecto
  const ciudadInicial = 'Madrid'; // Ciudad inicial por defecto
// Seleccionamos todos los contenedores de las letras
const letterHolders = document.querySelectorAll('.letterHolder, .letterHolder2');
const navItems = document.querySelectorAll('.navHeader .navItem');

// Redirige según el texto del span
navItems.forEach((navItem, index) => {
    navItem.addEventListener('click', () => {
      window.location.href = './pages/detalles.html';
    });
});

// Función para alternar la variación de la tipografía
function toggleFontVariation(letterHolder) {
    const letter = letterHolder.querySelector('.letterIcon');

    // Leer el estado actual desde el atributo data-cntm o asignar valor inicial
    const currentState = letter.dataset.cntm ? parseInt(letter.dataset.cntm, 10) : 100;

    // Determinar el nuevo valor
    const targetValue = currentState === 500 ? 100 : 500;

    // Guardar el nuevo estado en el atributo data-cntm
    letter.dataset.cntm = targetValue;

    // Incremento para la animación
    const increment = (targetValue - currentState) / 100;
    let currentValueAnim = currentState;

    const interval = setInterval(() => {
        currentValueAnim += increment;

        if (Math.abs(currentValueAnim - targetValue) <= Math.abs(increment)) {
            currentValueAnim = targetValue;
            clearInterval(interval); // Detener animación cuando alcance el valor objetivo
        }

        // Aplicar el nuevo estado a la propiedad fontVariationSettings
        letter.style.fontVariationSettings = `'cntm' ${Math.round(currentValueAnim)}`;
    }, 10); // Intervalo de animación
}

// Añadir un listener de clic a cada contenedor de letra
letterHolders.forEach(letterHolder => {
    letterHolder.addEventListener('click', () => toggleFontVariation(letterHolder));
});





  let currentFontVariation = 100; // Variable para rastrear el valor actual de cntm

  // Establecer valor inicial de font-variation-settings a 100
  textBox.style.fontVariationSettings = `'cntm' ${currentFontVariation}`; // Inicializamos con cntm:100

  // Establecer Madrid como predeterminado en el selector de provincias
  provinceSelector.value = estadoInicial;

  // Cargar ciudades al cambiar la provincia
  provinceSelector.addEventListener("change", () => {
     const estado = provinceSelector.value;
     cargarCiudades(estado);
  });

  // Acción al hacer clic en el botón para cargar datos de contaminación
  playButton.addEventListener("click", () => {
     actualizarTipografiaParaCiudadSeleccionada();
  });

  // Acción al hacer clic en el botón update-city
  updateCityButton.addEventListener("click", () => {
     actualizarTipografiaParaCiudadSeleccionada();
  });

  // Cargar las ciudades según la provincia
  function cargarCiudades(estado, ciudadPredeterminada = null) {
     const endpointCiudades = `https://api.airvisual.com/v2/cities?state=${estado}&country=${pais}&key=${apiKey}`;
     fetch(endpointCiudades)
        .then(response => response.json())
        .then(data => {
           citySelector.innerHTML = ''; // Vaciar el selector de ciudades
           const ciudades = data.data.map(city => city.city); // Obtener los nombres de las ciudades
           ciudades.forEach(ciudad => {
              const option = document.createElement("option");
              option.value = ciudad;
              option.textContent = ciudad;
              if (ciudad === ciudadPredeterminada) {
                 option.selected = true; // Seleccionar la ciudad predeterminada
              }
              citySelector.appendChild(option);
           });
           console.log(`Ciudades en ${estado}:`, ciudades);
        })
        .catch(error => {
           console.error('Error al cargar las ciudades', error);
        });
  }

  // Animación de la tipografía
  function actualizarTipografia(aqi) {
     let variationValue = Math.min(Math.max(100 + (aqi * 4), 100), 500);
     const increment = (variationValue - currentFontVariation) / 100; // Iniciar desde el estado actual

     const interval = setInterval(() => {
        currentFontVariation += increment;
        if (Math.abs(currentFontVariation - variationValue) <= Math.abs(increment)) {
           currentFontVariation = variationValue;
           clearInterval(interval);
        }
        textBox.style.fontVariationSettings = `'cntm' ${Math.round(currentFontVariation)}`;
        console.log(`Tipografía actualizada: cntm ${Math.round(currentFontVariation)}`);
     }, 10);
  }

  // Actualizar tipografía para la ciudad seleccionada
  function actualizarTipografiaParaCiudadSeleccionada() {
     const estado = provinceSelector.value;
     const ciudad = citySelector.value;

     const currentEndpoint = `https://api.airvisual.com/v2/city?city=${ciudad}&state=${estado}&country=${pais}&key=${apiKey}`;
     fetch(currentEndpoint)
        .then(response => response.json())
        .then(data => {
           console.log(data); // Muestra los datos de la API
           const aqi = data.data.current.pollution.aqius; // AQI (Air Quality Index)
           console.log(`Nivel de contaminación (AQI) en ${ciudad}, ${estado}: ${aqi}`);
           actualizarTipografia(aqi); // Actualiza la tipografía de forma fluida
        })
        .catch(error => {
           console.error('Error al obtener los datos de la API', error);
        });
  }

  // Ajustar el alto de la caja de texto automáticamente al escribir
  textBox.addEventListener("input", () => adjustHeight(textBox));

  function adjustHeight(element) {
     element.style.height = "auto"; // Restablece la altura inicial
     element.style.height = element.scrollHeight + "px"; // Ajusta la altura al contenido
  }

  // Inicializar con el estado y ciudad por defecto (Madrid)
  cargarCiudades(estadoInicial, ciudadInicial);
};
