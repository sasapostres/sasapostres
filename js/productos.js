let categoriaActual = null;
let seccionActual = null;
let precioMin = null;
let precioMax = null;
let sliderPrecio = null;

function resetearFiltros() {
  precioMin = null;
  precioMax = null;
  if (sliderPrecio && sliderPrecio.noUiSlider) {
    sliderPrecio.noUiSlider.reset();
  }
  const selectOrden = document.getElementById('ordenar-productos');
  if (selectOrden) selectOrden.value = 'relevancia';
}

function inicializarSliderPrecio() {
  const sliderEl = document.getElementById('slider-precio');
  if (!sliderEl || typeof noUiSlider === 'undefined') return;

  const precios = productosGlobales.map(p => obtenerPrecioEfectivo(p));
  const min = Math.min(0, ...precios);
  const max = Math.max(200, ...precios);

  noUiSlider.create(sliderEl, {
    start: [min, max],
    connect: true,
    range: { 'min': 0, 'max': Math.ceil(max) },
    step: 1,
    format: {
      to: value => `S/ ${Math.round(value)}`,
      from: value => Number(value.replace('S/ ', ''))
    }
  });

  sliderEl.noUiSlider.on('update', (values) => {
    document.getElementById('min-precio').textContent = values[0];
    document.getElementById('max-precio').textContent = values[1];
  });

  document.getElementById('aplicar-filtro-precio').addEventListener('click', () => {
    const valores = sliderEl.noUiSlider.get();
    precioMin = parseFloat(valores[0].replace('S/ ', ''));
    precioMax = parseFloat(valores[1].replace('S/ ', ''));
    mostrarProductosFiltrados();
  });

  sliderPrecio = sliderEl;
}

/**
 * @param {Array} productos
 * @returns {Array}
 */
function filtrarPorForma(productos) {
  if (!categoriaActual || categoriaActual.toLowerCase() !== 'base para tortas') {
    return productos;
  }

  const checkboxes = document.querySelectorAll('.checkbox-forma:checked');
  const formasSeleccionadas = Array.from(checkboxes).map(cb => cb.value.toLowerCase());

  if (formasSeleccionadas.length === 0) return productos;

  return productos.filter(p => {
    if (Array.isArray(p.forma)) {
      return p.forma.some(f => formasSeleccionadas.includes(f.toLowerCase()));
    }
    if (typeof p.forma === 'string') {
      return formasSeleccionadas.includes(p.forma.toLowerCase());
    }
    return false;
  });
}

function controlarFiltroForma() {
  const filtroFormas = document.getElementById('filtro-formas-base');
  const contenedorMovil = document.getElementById('contenedor-forma-movil');
  const esBaseTorta = categoriaActual?.toLowerCase() === 'base para tortas';

  if (filtroFormas) {
    filtroFormas.classList.toggle('oculto', !esBaseTorta);
  }

  if (contenedorMovil) {
    contenedorMovil.style.display = (esBaseTorta && window.innerWidth < 720) ? 'block' : 'none';
  }
}

/**
 * @param {Array} [productosBase] 
 * @returns {Array}
 */
function aplicarFiltros(productosBase = null) {
  let productos = productosBase ? [...productosBase] : [...productosGlobales];

  if (categoriaActual && categoriaActual.toLowerCase() !== 'todos') {
    productos = productos.filter(p =>
      p.categoria.toLowerCase() === categoriaActual.toLowerCase()
    );
  }

  if (seccionActual) {
    productos = productos.filter(p => {
      switch (seccionActual) {
        case 'destacado': return p.destacado === true;
        case 'oferta': return p.oferta === true;
        case 'especial': return p.especial === true;
        default: return true;
      }
    });
  }

  productos = filtrarPorForma(productos);

  if (precioMin !== null && precioMax !== null) {
    productos = productos.filter(p => {
      const precio = obtenerPrecioEfectivo(p);
      return precio >= precioMin && precio <= precioMax;
    });
  }

  productos.sort((a, b) => b.id - a.id);

  return productos;
}

function mostrarProductosFiltrados() {
  const contenedor = document.getElementById('contenedor-productos');
  const titulo = document.getElementById('titulo-categoria');
  if (!contenedor) return;

  const productosFiltrados = aplicarFiltros();
  controlarFiltroForma();

  if (titulo) {
    if (seccionActual) {
      const titulos = {
        'destacado': 'Productos Destacados',
        'oferta': 'Super Ofertas',
        'novedad': 'Novedades'
      };
      titulo.textContent = titulos[seccionActual] || 'Productos';
    } else if (categoriaActual && categoriaActual.toLowerCase() !== 'todos') {
      titulo.textContent = `Categoría: ${capitalizar(categoriaActual)}`;
    } else {
      titulo.textContent = 'Todos los Productos';
    }
  }

  renderizarProductos(productosFiltrados, 'contenedor-productos', 'No hay productos con estos filtros.');

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function configurarPaginaCatalogo() {
  const selectOrden = document.getElementById('ordenar-productos');
  if (selectOrden) {
    selectOrden.addEventListener('change', () => ordenarProductosDOM('ordenar-productos', 'contenedor-productos'));
  }

  document.querySelectorAll('.checkbox-forma').forEach(cb => {
    cb.addEventListener('change', mostrarProductosFiltrados);
  });

  const filtroFormaMovil = document.getElementById('filtro-forma-movil');
  if (filtroFormaMovil) {
    filtroFormaMovil.addEventListener('change', () => {
      document.querySelectorAll('.checkbox-forma').forEach(cb => cb.checked = false);
      if (filtroFormaMovil.value) {
        const checkbox = document.querySelector(`.checkbox-forma[value="${filtroFormaMovil.value}"]`);
        if (checkbox) checkbox.checked = true;
      }
      mostrarProductosFiltrados();
    });
  }

  document.querySelectorAll('#lista-categorias .categoria-item').forEach(item => {
    item.addEventListener('click', function () {
      const cat = this.textContent.replace('Todos los productos', '').trim();
      categoriaActual = cat || null;
      seccionActual = null;
      resetearFiltros();
      mostrarProductosFiltrados();
      document.querySelectorAll('.categoria-item, .seccion-item').forEach(i => i.classList.remove('activa', 'activo'));
      this.classList.add('activa');
    });
  });

  document.querySelectorAll('.seccion-item').forEach(item => {
    item.addEventListener('click', function () {
      const nuevaSeccion = this.getAttribute('data-seccion');
      if (seccionActual === nuevaSeccion) {
        seccionActual = null;
        categoriaActual = null;
        document.querySelectorAll('.seccion-item, .categoria-item').forEach(i => i.classList.remove('activo', 'activa'));
      } else {
        seccionActual = nuevaSeccion;
        categoriaActual = null;
        document.querySelectorAll('.seccion-item, .categoria-item').forEach(i => i.classList.remove('activo', 'activa'));
        this.classList.add('activo');
      }
      resetearFiltros();
      mostrarProductosFiltrados();
    });
  });

  window.addEventListener('resize', controlarFiltroForma);
}

function cargarCategoriasSidebar() {
  const listaCategorias = document.getElementById('lista-categorias');
  if (!listaCategorias) return;

  const categorias = obtenerCategorias();
  const categoriaURL = obtenerParametroURL('categoria');

  listaCategorias.innerHTML = '';

  const itemTodos = document.createElement('div');
  itemTodos.className = 'categoria-item' + (!categoriaURL ? ' activa' : '');
  itemTodos.innerHTML = '<i class="fas fa-box-open"></i> Todos los productos';
  itemTodos.addEventListener('click', function () {
    categoriaActual = null;
    seccionActual = null;
    resetearFiltros();
    mostrarProductosFiltrados();
    document.querySelectorAll('.categoria-item, .seccion-item').forEach(i => i.classList.remove('activa', 'activo'));
    this.classList.add('activa');
  });
  listaCategorias.appendChild(itemTodos);

  categorias.forEach(cat => {
    const item = document.createElement('div');
    item.className = 'categoria-item' + (categoriaURL === cat ? ' activa' : '');
    item.innerHTML = `<i class="fas fa-folder"></i> ${capitalizar(cat)}`;
    item.addEventListener('click', function () {
      categoriaActual = cat;
      seccionActual = null;
      resetearFiltros();
      mostrarProductosFiltrados();
      document.querySelectorAll('.categoria-item, .seccion-item').forEach(i => i.classList.remove('activa', 'activo'));
      this.classList.add('activa');
    });
    listaCategorias.appendChild(item);
  });

  if (categoriaURL) {
    categoriaActual = categoriaURL;
  }
}

async function cargarPaginaResultados() {
  const urlParams = new URLSearchParams(window.location.search);
  const mostrarDestacados = urlParams.get('destacados') === 'true';
  const mostrarOfertas = urlParams.get('ofertas') === 'true';
  const mostrarEspeciales = urlParams.get('especiales') === 'true';
  const termino = urlParams.get('q') || '';

  await cargarProductos();

  let resultados = [];

  if (mostrarDestacados) {
    resultados = productosGlobales.filter(p => p.destacado === true);
    document.getElementById('titulo-busqueda').textContent = 'Productos Destacados';
  } else if (mostrarOfertas) {
    resultados = productosGlobales.filter(p => p.oferta === true);
    document.getElementById('titulo-busqueda').textContent = 'Super Ofertas';
  } else if (mostrarEspeciales) {
    resultados = productosGlobales.filter(p => p.especial === true);
    document.getElementById('titulo-busqueda').textContent = 'Novedades';
  } else if (termino) {
    resultados = buscarProductos(termino);
    document.getElementById('titulo-busqueda').textContent = `Resultados para "${termino}"`;
  }

  resultados.sort((a, b) => b.id - a.id);

  const contador = document.getElementById('contador-resultados');
  if (contador) {
    contador.textContent = `${resultados.length} ${resultados.length === 1 ? 'producto encontrado' : 'productos encontrados'}`;
  }

  renderizarProductos(resultados, 'resultados-grid', 'No se encontraron productos que coincidan con tu búsqueda.');

  const selectOrden = document.getElementById('ordenar-productos');
  if (selectOrden) {
    selectOrden.addEventListener('change', () => ordenarProductosDOM('ordenar-productos', 'resultados-grid'));
  }
}
