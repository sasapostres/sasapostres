function mostrarPantallaCarga() {
  const pantalla = document.getElementById('pantallaCarga');
  pantalla.style.display = 'flex';
  pantalla.classList.remove('oculto');
}

function ocultarPantallaCarga() {
  const pantalla = document.getElementById('pantallaCarga');
  pantalla.classList.add('oculto');
  setTimeout(() => {
    pantalla.style.display = 'none';
  }, 800);
}

function esPrimeraCarga() {
  if (sessionStorage.getItem('primeraCarga') === null) {
    sessionStorage.setItem('primeraCarga', 'false');
    return true;
  }
  return false;
}

document.addEventListener('DOMContentLoaded', function() {
  mostrarPantallaCarga();
  
  const duracion = esPrimeraCarga() ? 4000 : 1000;
  
  setTimeout(() => {
    ocultarPantallaCarga();
  }, duracion);

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
  
  window.addEventListener('pageshow', function(event) {
    if (event.persisted) {
      mostrarPantallaCarga();
      setTimeout(ocultarPantallaCarga, 1000);
    }
  });
});