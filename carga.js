// Función para mostrar la pantalla de carga
function mostrarPantallaCarga() {
  const pantalla = document.getElementById('pantallaCarga');
  pantalla.style.display = 'flex';
  pantalla.classList.remove('oculto');
}

// Función para ocultar la pantalla de carga
function ocultarPantallaCarga() {
  const pantalla = document.getElementById('pantallaCarga');
  pantalla.classList.add('oculto');
  setTimeout(() => {
    pantalla.style.display = 'none';
  }, 800);
}

// Verificar si es la primera carga usando sessionStorage
function esPrimeraCarga() {
  if (sessionStorage.getItem('primeraCarga') === null) {
    sessionStorage.setItem('primeraCarga', 'false');
    return true;
  }
  return false;
}

// Inicialización cuando el DOM está listo
document.addEventListener('DOMContentLoaded', function() {
  // Mostrar pantalla de carga inmediatamente
  mostrarPantallaCarga();
  
  // Determinar duración basada en si es primera carga o no
  const duracion = esPrimeraCarga() ? 4000 : 1000;
  
  setTimeout(() => {
    ocultarPantallaCarga();
  }, duracion);

  // Manejar clics en enlaces internos
  document.querySelectorAll('a').forEach(link => {
    if (link.href && !link.href.startsWith('javascript:') && 
        !link.href.startsWith('#') && link.href.includes(window.location.hostname)) {
      link.addEventListener('click', function(e) {
        if (!this.classList.contains('boton-volver')) {
          e.preventDefault();
          mostrarPantallaCarga();
          setTimeout(() => {
            window.location.href = this.href;
          }, 50);
        }
      });
    }
  });
  
  // Manejar el botón de retroceso
  window.addEventListener('pageshow', function(event) {
    if (event.persisted) {
      mostrarPantallaCarga();
      setTimeout(ocultarPantallaCarga, 1000);
    }
  });
});