// ==========================================
// js/funciones.js - Utilidades y Estado Global
// ==========================================

// Estado global compartido entre todas las páginas
let productosGlobales = [];
let cargaCompletada = false;

/**
 * Carga los productos desde el JSON. Usa caché para no repetir la petición.
 * @returns {Promise<Array>} Array de productos
 */
async function cargarProductos() {
  if (cargaCompletada && productosGlobales.length > 0) {
    return productosGlobales;
  }

  try {
    const response = await fetch('productos.json');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    productosGlobales = data.productos;
    cargaCompletada = true;
    return productosGlobales;
  } catch (error) {
    console.error('Error al cargar productos:', error);
    return [];
  }
}

/**
 * Obtiene los productos ya cargados (sin hacer fetch)
 * @returns {Array} Array de productos
 */
function obtenerProductos() {
  return productosGlobales;
}

/**
 * Capitaliza la primera letra de un string
 * @param {string} str
 * @returns {string}
 */
function capitalizar(str) {
  if (!str || typeof str !== 'string') return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Obtiene el valor de un parámetro de la URL
 * @param {string} nombre - Nombre del parámetro
 * @param {string} [url] - URL opcional (por defecto window.location.href)
 * @returns {string|null}
 */
function obtenerParametroURL(nombre, url) {
  if (!url) url = window.location.href;
  nombre = nombre.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp('[?&]' + nombre + '(=([^&#]*)|&|#|$)');
  const results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

/**
 * Busca productos por término (nombre o categoría)
 * @param {string} termino
 * @returns {Array}
 */
function buscarProductos(termino) {
  if (!productosGlobales.length) return [];
  const term = termino.toLowerCase().trim();
  return productosGlobales.filter(p =>
    p.nombre.toLowerCase().includes(term) ||
    p.categoria.toLowerCase().includes(term)
  );
}

/**
 * Obtiene las categorías únicas ordenadas alfabéticamente
 * @returns {Array<string>}
 */
function obtenerCategorias() {
  return [...new Set(productosGlobales.map(p => p.categoria.trim()))]
    .sort((a, b) => a.localeCompare(b));
}

/**
 * Calcula el porcentaje de descuento de un producto
 * @param {Object} producto
 * @returns {number}
 */
function calcularDescuento(producto) {
  if (!producto.oferta || !producto.precioOferta || producto.precio <= 0) return 0;
  return Math.round(((producto.precio - producto.precioOferta) / producto.precio) * 100);
}

/**
 * Obtiene el precio efectivo de un producto (oferta o normal)
 * @param {Object} producto
 * @returns {number}
 */
function obtenerPrecioEfectivo(producto) {
  return producto.oferta && producto.precioOferta > 0 ? producto.precioOferta : producto.precio;
}

/**
 * Ordena productos por ID descendente (más nuevos primero)
 * @param {Array} productos
 * @returns {Array}
 */
function ordenarPorNuevos(productos) {
  return [...productos].sort((a, b) => b.id - a.id);
}

/**
 * Muestra el precio formateado
 * @param {number} precio
 * @returns {string}
 */
function formatearPrecio(precio) {
  return `S/ ${precio.toFixed(2)}`;
}

// ==========================================
// PANTALLA DE CARGA (integrada)
// ==========================================
function mostrarPantallaCarga() {
  const pantalla = document.getElementById('pantallaCarga');
  if (!pantalla) return;
  pantalla.style.display = 'flex';
  pantalla.classList.remove('oculto');
}

function ocultarPantallaCarga() {
  const pantalla = document.getElementById('pantallaCarga');
  if (!pantalla) return;
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

function iniciarPantallaCarga() {
  mostrarPantallaCarga();
  const duracion = esPrimeraCarga() ? 4000 : 1000;
  setTimeout(ocultarPantallaCarga, duracion);
}

function configurarNavegacionConCarga() {
  document.querySelectorAll('a').forEach(link => {
    if (
      link.href &&
      !link.href.startsWith('javascript:') &&
      !link.href.startsWith('#') &&
      link.href.includes(window.location.hostname) &&
      !link.classList.contains('boton-volver') &&
      !link.classList.contains('whatsapp-btn')
    ) {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        const destino = this.href;
        mostrarPantallaCarga();
        setTimeout(() => {
          window.location.href = destino;
        }, 50);
      });
    }
  });

  window.addEventListener('pageshow', function (event) {
    if (event.persisted) {
      mostrarPantallaCarga();
      setTimeout(ocultarPantallaCarga, 1000);
    }
  });
}

// ==========================================
// BOTÓN VOLVER ARRIBA
// ==========================================
function crearBotonSubir() {
  if (document.getElementById('boton-subir')) return;

  const boton = document.createElement('button');
  boton.id = 'boton-subir';
  boton.className = 'boton-subir';
  boton.title = 'Volver arriba';
  boton.innerHTML = '<i class="fas fa-chevron-up"></i>';
  boton.setAttribute('aria-label', 'Volver al inicio de la página');
  boton.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
  document.body.appendChild(boton);
}

function toggleBotonSubir() {
  const boton = document.getElementById('boton-subir');
  if (!boton) return;
  boton.classList.toggle('visible', window.scrollY > 300);
}

function configurarBotonSubir() {
  crearBotonSubir();
  window.addEventListener('scroll', toggleBotonSubir);
  toggleBotonSubir();
}

// ==========================================
// EFECTO NIEVE
// ==========================================
function iniciarNieve() {
  const contenedor = document.getElementById('efecto-nieve');
  if (!contenedor) return;

  const numeroCopos = 50;

  function crearCopo() {
    const copo = document.createElement('div');
    copo.innerHTML = '❄';
    copo.classList.add('copo-nieve');

    const izquierda = Math.random() * 100;
    const duracion = 10 + Math.random() * 20;
    const retraso = Math.random() * 15;
    const tamaño = 15 + Math.random() * 20;

    copo.style.left = `${izquierda}vw`;
    copo.style.fontSize = `${tamaño}px`;
    copo.style.animationDuration = `${duracion}s`;
    copo.style.animationDelay = `${retraso}s`;
    copo.style.opacity = `${0.3 + Math.random() * 0.7}`;

    contenedor.appendChild(copo);

    setTimeout(() => {
      copo.remove();
      crearCopo();
    }, (duracion + retraso) * 1000);
  }

  for (let i = 0; i < numeroCopos; i++) {
    crearCopo();
  }
}

async function inicializarSitio() {
  await cargarProductos();
  iniciarPantallaCarga();
  configurarNavegacionConCarga();
  iniciarNieve();
  configurarBotonSubir();
}