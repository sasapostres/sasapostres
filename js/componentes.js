// ==========================================
// js/componentes.js - Componentes Visuales Reutilizables
// ==========================================

// ==========================================
// 1. TARJETA DE PRODUCTO (ÚNICA PARA TODO EL SITIO)
// ==========================================

/**
 * Crea el HTML de una tarjeta de producto
 * @param {Object} producto - Objeto producto del JSON
 * @returns {string} HTML de la tarjeta
 */
function crearTarjetaProducto(producto) {
  const descuento = calcularDescuento(producto);
  const precioEfectivo = obtenerPrecioEfectivo(producto);
  const precioOriginal = producto.oferta && producto.precioOferta > 0 ? producto.precio : null;

  let badgeTopRight = '';
  if (producto.oferta && descuento > 0) {
    badgeTopRight = `<span class="badge-descuento">-${descuento}%</span>`;
  } else if (producto.destacado) {
    badgeTopRight = '<span class="badge-destacado">Destacado</span>';
  }

  const badgeUnidad = producto.unidad
    ? `<span class="badge-unidad">${producto.unidad}</span>`
    : '';

  return `
    <div class="tarjeta-producto" data-id="${producto.id}" data-categoria="${producto.categoria}">
      ${badgeTopRight}
      ${badgeUnidad}
      <img src="${producto.imagen}" alt="${producto.nombre}" loading="lazy">
      <div class="info-producto">
        <span class="product-category">${producto.categoria}</span>
        <div class="nombre-producto">${producto.nombre}</div>
        <div class="product-footer">
          <span class="${precioOriginal ? 'precio-oferta' : 'precio-producto'}">
            ${formatearPrecio(precioEfectivo)}
          </span>
          ${precioOriginal ? `<span class="precio-original">${formatearPrecio(precioOriginal)}</span>` : ''}
        </div>
      </div>
    </div>
  `;
}

/**
 * Renderiza un array de productos en un contenedor con animación fade
 * @param {Array} productos - Array de productos a renderizar
 * @param {string} contenedorId - ID del elemento contenedor
 * @param {string} [mensajeVacio] - Mensaje si no hay productos
 */
function renderizarProductos(productos, contenedorId, mensajeVacio = 'No hay productos disponibles.') {
  const contenedor = document.getElementById(contenedorId);
  if (!contenedor) return;

  contenedor.classList.add('fade-out');

  setTimeout(() => {
    if (!productos || productos.length === 0) {
      contenedor.innerHTML = `<p class="sin-productos">${mensajeVacio}</p>`;
    } else {
      contenedor.innerHTML = productos.map(crearTarjetaProducto).join('');
    }

    contenedor.classList.remove('fade-out');
    contenedor.classList.add('fade-in');
    setTimeout(() => contenedor.classList.remove('fade-in'), 500);
  }, 300);
}

// ==========================================
// 2. BARRA DE BÚSQUEDA (CONFIGURACIÓN ÚNICA)
// ==========================================

/**
 * Configura la barra de búsqueda con sugerencias en tiempo real
 * @param {string} inputId - ID del input de búsqueda
 * @param {string} resultadosId - ID del div de resultados
 * @param {string} btnId - ID del botón de búsqueda
 * @param {string} [paginaDestino] - Página a la que redirige (por defecto: resultados-busqueda.html)
 */
function configurarBusqueda(inputId = 'input-buscar', resultadosId = 'resultados-busqueda', btnId = 'btn-buscar', paginaDestino = 'resultados-busqueda.html') {
  const inputBuscar = document.getElementById(inputId);
  const resultadosDiv = document.getElementById(resultadosId);
  const btnBuscar = document.getElementById(btnId);

  if (!inputBuscar) return;

  // Sugerencias al escribir
  inputBuscar.addEventListener('input', function () {
    const termino = this.value.trim();
    resultadosDiv.innerHTML = '';

    if (termino.length < 2) {
      resultadosDiv.style.display = 'none';
      return;
    }

    const resultados = buscarProductos(termino).slice(0, 8); // Máximo 8 sugerencias

    if (resultados.length > 0) {
      resultados.forEach(producto => {
        const item = document.createElement('div');
        item.className = 'resultado-item';
        item.innerHTML = `
          <div style="display: flex; align-items: center; gap: 10px;">
            <img src="${producto.imagen}" alt="${producto.nombre}" 
                 style="width: 45px; height: 45px; object-fit: contain; border-radius: 8px;">
            <div style="flex: 1; min-width: 0;">
              <div style="font-weight: 600; font-size: 0.85rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${producto.nombre}</div>
              <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
                ${producto.oferta ? `<span style="text-decoration: line-through; color: #999; font-size: 0.75rem;">${formatearPrecio(producto.precio)}</span>` : ''}
                <span style="color: #D23C6E; font-weight: 700; font-size: 0.85rem;">
                  ${formatearPrecio(obtenerPrecioEfectivo(producto))}
                </span>
                ${producto.oferta ? `<span style="background: #10b981; color: white; padding: 2px 6px; border-radius: 10px; font-size: 0.65rem; font-weight: 700;">-${calcularDescuento(producto)}%</span>` : ''}
              </div>
            </div>
          </div>`;

        item.addEventListener('click', (e) => {
          e.stopPropagation();
          window.location.href = `${paginaDestino}?q=${encodeURIComponent(producto.nombre)}`;
        });
        resultadosDiv.appendChild(item);
      });
      resultadosDiv.style.display = 'block';
    } else {
      resultadosDiv.innerHTML = '<div class="resultado-item" style="color: #999;">No se encontraron productos</div>';
      resultadosDiv.style.display = 'block';
    }
  });

  // Botón de búsqueda
  if (btnBuscar) {
    btnBuscar.addEventListener('click', function () {
      const termino = inputBuscar.value.trim();
      if (termino.length > 0) {
        window.location.href = `${paginaDestino}?q=${encodeURIComponent(termino)}`;
      }
    });
  }

  // Enter para buscar
  inputBuscar.addEventListener('keypress', function (e) {
    if (e.key === 'Enter' && this.value.trim().length > 0) {
      window.location.href = `${paginaDestino}?q=${encodeURIComponent(this.value.trim())}`;
    }
  });

  // Cerrar sugerencias al hacer clic fuera
  document.addEventListener('click', function (e) {
    if (!e.target.closest('.contenedor-busqueda') && !e.target.closest('.grupo-busqueda') && !e.target.closest('.grupo-busqueda-flotante')) {
      resultadosDiv.style.display = 'none';
    }
  });
}

// ==========================================
// 3. MENÚ LATERAL DE CATEGORÍAS
// ==========================================

/**
 * Abre el menú lateral de categorías
 */
function toggleMenuCategorias() {
  const sidebar = document.getElementById('sidebar-categorias');
  const overlay = document.getElementById('overlay-sidebar');

  if (!sidebar || !overlay) return;

  sidebar.classList.add('visible');
  overlay.classList.add('visible');
  sidebar.classList.remove('oculto');
  overlay.classList.remove('oculto');
  document.body.style.overflow = 'hidden';

  cargarMenuCompleto();
}

/**
 * Cierra el menú lateral de categorías
 */
function cerrarMenuCategorias() {
  const sidebar = document.getElementById('sidebar-categorias');
  const overlay = document.getElementById('overlay-sidebar');

  if (!sidebar || !overlay) return;

  sidebar.classList.remove('visible');
  overlay.classList.remove('visible');
  document.body.style.overflow = '';

  setTimeout(() => {
    sidebar.classList.add('oculto');
    overlay.classList.add('oculto');
  }, 300);
}

/**
 * Carga las categorías y secciones en el menú lateral
 */
function cargarMenuCompleto() {
  const listaCategorias = document.getElementById('menu-categorias');
  if (!listaCategorias) return;

  const categorias = obtenerCategorias();

  listaCategorias.innerHTML = '';

  // Opción "Todos los productos"
  const itemTodos = document.createElement('div');
  itemTodos.className = 'categoria-item';
  itemTodos.innerHTML = '<i class="fas fa-box-open"></i> Todos los productos';
  itemTodos.addEventListener('click', () => {
    window.location.href = 'todos-productos.html';
    cerrarMenuCategorias();
  });
  listaCategorias.appendChild(itemTodos);

  // Categorías
  categorias.forEach(cat => {
    const item = document.createElement('div');
    item.className = 'categoria-item';
    item.innerHTML = `<i class="fas fa-folder"></i> ${capitalizar(cat)}`;
    item.addEventListener('click', () => {
      window.location.href = `todos-productos.html?categoria=${encodeURIComponent(cat)}`;
      cerrarMenuCategorias();
    });
    listaCategorias.appendChild(item);
  });

  // Secciones
  document.querySelectorAll('.seccion-item').forEach(item => {
    item.addEventListener('click', function () {
      const seccion = this.getAttribute('data-seccion');
      cerrarMenuCategorias();

      const rutas = {
        'destacados': 'resultados-busqueda.html?destacados=true',
        'ofertas': 'resultados-busqueda.html?ofertas=true',
        'especiales': 'resultados-busqueda.html?especiales=true'
      };

      if (rutas[seccion]) {
        window.location.href = rutas[seccion];
      }
    });
  });
}

// ==========================================
// 4. ORDENAR PRODUCTOS EN EL DOM
// ==========================================

/**
 * Ordena los productos visibles en un contenedor según el criterio seleccionado
 * @param {string} selectId - ID del elemento <select>
 * @param {string} contenedorId - ID del contenedor de productos
 */
function ordenarProductosDOM(selectId = 'ordenar-productos', contenedorId = 'contenedor-productos') {
  const select = document.getElementById(selectId);
  const contenedor = document.getElementById(contenedorId);
  if (!select || !contenedor) return;

  const valor = select.value;

  contenedor.classList.add('fade-out');

  setTimeout(() => {
    const productosDOM = Array.from(contenedor.children).filter(
      child => child.classList.contains('tarjeta-producto')
    );

    productosDOM.sort((a, b) => {
      const nombreA = (a.querySelector('.nombre-producto')?.textContent || '').toLowerCase();
      const nombreB = (b.querySelector('.nombre-producto')?.textContent || '').toLowerCase();

      const precioElA = a.querySelector('.precio-oferta') || a.querySelector('.precio-producto');
      const precioElB = b.querySelector('.precio-oferta') || b.querySelector('.precio-producto');

      const precioA = parseFloat((precioElA?.textContent || 'S/ 0').replace('S/ ', '')) || 0;
      const precioB = parseFloat((precioElB?.textContent || 'S/ 0').replace('S/ ', '')) || 0;

      switch (valor) {
        case 'nombreAZ': return nombreA.localeCompare(nombreB);
        case 'nombreZA': return nombreB.localeCompare(nombreA);
        case 'precioAsc': return precioA - precioB;
        case 'precioDesc': return precioB - precioA;
        default: return 0;
      }
    });

    contenedor.innerHTML = '';
    productosDOM.forEach(p => contenedor.appendChild(p));

    contenedor.classList.remove('fade-out');
    contenedor.classList.add('fade-in');
    setTimeout(() => contenedor.classList.remove('fade-in'), 500);
  }, 300);
}