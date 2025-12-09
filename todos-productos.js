let productosGlobales = [];
let categoriaActual = null;
let seccionActual = null;
let precioMin = null;
let precioMax = null;
let sliderPrecio = null;

function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
}

function getParameterByName(name, url) {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)');
  const results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

function resetearFiltros() {
  precioMin = null;
  precioMax = null;
  if (sliderPrecio) {
    sliderPrecio.reset();
  }
  reiniciarOrden();
}

function inicializarSliderPrecio() {
  const precios = productosGlobales.map(p => p.oferta ? p.precioOferta : p.precio);
  const min = Math.min(0,...precios);
  const max = Math.max(199.99, ...precios);
  
  sliderPrecio = noUiSlider.create(document.getElementById('slider-precio'), {
    start: [min, max],
    connect: true,
    range: { 'min': 0, 'max': 199.99 },
    step: 1,
    format: {
      to: value => 'S/ ' + parseInt(value),
      from: value => Number(value.replace('S/ ', ''))
    }
  });
  
  sliderPrecio.on('update', (values, handle) => {
    document.getElementById(handle ? 'max-precio' : 'min-precio').textContent = values[handle];
  });
  
  document.getElementById('aplicar-filtro-precio').addEventListener('click', () => {
    const valores = sliderPrecio.get();
    precioMin = parseFloat(valores[0].replace('S/ ', ''));
    precioMax = parseFloat(valores[1].replace('S/ ', ''));
    mostrarProductos();
  });
}

async function cargarProductos() {
  try {
    const response = await fetch('productos.json');
    const data = await response.json();
    productosGlobales = data.productos;
    return productosGlobales;
  } catch (error) {
    console.error('Error al cargar productos:', error);
    return [];
  }
}

function cargarCategorias() {
  const categoriasUnicas = [...new Set(productosGlobales.map(p => p.categoria))];
  const listaCategorias = document.getElementById('lista-categorias');
  const menuCategorias = document.getElementById('menu-categorias');
  
  categoriasUnicas.sort((a, b) => a.localeCompare(b));

  listaCategorias.innerHTML = '';
  menuCategorias.innerHTML = '';
  
  const categoriaURL = getParameterByName('categoria');
  
  const itemTodos = document.createElement('div');
  itemTodos.className = 'categoria-item' + (!categoriaActual && !categoriaURL ? ' activa' : '');
  itemTodos.innerHTML = '<i class="fas fa-box-open"></i> Todos los productos';
  itemTodos.addEventListener('click', function() {
    categoriaActual = null;
    seccionActual = null;
    resetearFiltros();
    mostrarProductos();
    document.getElementById('titulo-categoria').textContent = 'Todos los Productos';
    document.querySelectorAll('.categoria-item, .seccion-item').forEach(i => i.classList.remove('activa', 'activo'));
    this.classList.add('activa');
    cerrarMenuCategorias();
  });
  listaCategorias.appendChild(itemTodos);
  
  const itemTodosMenu = itemTodos.cloneNode(true);
  menuCategorias.appendChild(itemTodosMenu);

  categoriasUnicas.forEach(cat => {
    const item = document.createElement('div');
    item.className = 'categoria-item' + 
      ((categoriaActual === cat || categoriaURL === cat) ? ' activa' : '');
    item.innerHTML = `<i class="fas fa-folder"></i> ${cat.charAt(0).toUpperCase() + cat.slice(1)}`;
    item.addEventListener('click', function() {
      categoriaActual = cat;
      seccionActual = null;
      resetearFiltros();
      mostrarProductos();
      controlarFiltroFormaMovil();
      document.getElementById('titulo-categoria').textContent = `Categoría: ${cat.charAt(0).toUpperCase() + cat.slice(1)}`;
      document.querySelectorAll('.categoria-item, .seccion-item').forEach(i => i.classList.remove('activa', 'activo'));
      this.classList.add('activa');
      itemTodos.classList.remove('activa');
      cerrarMenuCategorias();
      scrollToTop();
    });
    listaCategorias.appendChild(item);
    
    const itemMenu = item.cloneNode(true);
    itemMenu.addEventListener('click', function() {
      categoriaActual = cat;
      seccionActual = null;
      resetearFiltros();
      mostrarProductos();
      controlarFiltroFormaMovil();
      document.getElementById('titulo-categoria').textContent = `Categoría: ${cat.charAt(0).toUpperCase() + cat.slice(1)}`;
      document.querySelectorAll('.categoria-item, .seccion-item').forEach(i => i.classList.remove('activa', 'activo'));
      this.classList.add('activa');
      itemTodosMenu.classList.remove('activa');
      cerrarMenuCategorias();
      scrollToTop();
    });
    menuCategorias.appendChild(itemMenu);
  });

  if (categoriaURL) {
    categoriaActual = categoriaURL;
    document.getElementById('titulo-categoria').textContent = `Categoría: ${categoriaURL.charAt(0).toUpperCase() + categoriaURL.slice(1)}`;
  }
}

function mostrarProductos() {
  window.addEventListener('resize', controlarFiltroFormaMovil);

  const contenedor = document.getElementById('contenedor-productos');
  const tituloCategoria = document.getElementById('titulo-categoria');
  
  let productosFiltrados = [...productosGlobales]; 
  if (categoriaActual) {
  productosFiltrados = productosFiltrados.filter(p => p.categoria === categoriaActual);
  }

  productosFiltrados = filtrarPorForma(productosFiltrados);


  if (categoriaActual && categoriaActual.toLowerCase() !== 'todos') {
    productosFiltrados = productosFiltrados.filter(p => 
      p.categoria.toLowerCase() === categoriaActual.toLowerCase()
    );
    tituloCategoria.textContent = `Categoría: ${categoriaActual.charAt(0).toUpperCase() + categoriaActual.slice(1)}`;
  }
  
  if (seccionActual) {
    productosFiltrados = productosFiltrados.filter(p => {
      if (seccionActual === 'destacado') return p.destacado === true;
      if (seccionActual === 'oferta') return p.oferta === true;
      if (seccionActual === 'especial') return p.especial === true;
      return true;
    });
    
    const titulosSecciones = {
      'destacado': 'Productos Destacados',
      'oferta': 'Super Ofertas',
      'especial': 'Feliz Navidad'
    };
    tituloCategoria.textContent = titulosSecciones[seccionActual];
  } else if (!categoriaActual) {
    tituloCategoria.textContent = 'Todos los Productos';
  }
  
  if (precioMin !== null && precioMax !== null) {
    productosFiltrados = productosFiltrados.filter(p => {
      const precio = p.oferta ? p.precioOferta : p.precio;
      return precio >= precioMin && precio <= precioMax;
    });
  }


contenedor.classList.add('fade-out');

setTimeout(() => {
  contenedor.innerHTML = '';

  if (productosFiltrados.length === 0) {
    contenedor.innerHTML = '<p class="sin-productos">No hay productos con estos filtros.</p>';
    contenedor.classList.remove('fade-out');
    contenedor.classList.add('fade-in');
    setTimeout(() => contenedor.classList.remove('fade-in'), 500);
    return;
  }

  productosFiltrados.forEach(producto => {
    const descuento = producto.oferta 
      ? Math.round(((producto.precio - producto.precioOferta) / producto.precio) * 100)
      : 0;

    contenedor.innerHTML += `
      <div class="tarjeta-producto">
        ${producto.unidad ? `<span class="badge-unidad">${producto.unidad}</span>` : ''}
        ${producto.oferta ? `<span class="badge-descuento">-${descuento}%</span>` : ''}
        ${producto.destacado ? '<span class="badge-destacado">Destacado</span>' : ''}
        ${producto.especial ? '<span class="badge-especial"><i class="fas fa-star"></i></span>' : ''}
        <img src="${producto.imagen}" alt="${producto.nombre}" loading="lazy">
        <div class="info-producto">
          <div class="nombre-producto">${producto.nombre}</div>
          <div class="precio-container">
            ${producto.oferta ? `<span class="precio-original">S/ ${producto.precio.toFixed(2)}</span>` : ''}
            <span class="${producto.oferta ? 'precio-oferta' : 'precio-producto'}">
              S/ ${producto.oferta ? producto.precioOferta.toFixed(2) : producto.precio.toFixed(2)}
            </span>
          </div>
        </div>
      </div>`;
  });

  contenedor.classList.remove('fade-out');
  contenedor.classList.add('fade-in');
  setTimeout(() => contenedor.classList.remove('fade-in'), 500);
}, 300);

}


function controlarFiltroFormaMovil() {
  const contenedorMovil = document.getElementById('contenedor-forma-movil');

  const esMovil = window.innerWidth < 720;
  const esBaseParaTortas = categoriaActual?.toLowerCase() === 'base para tortas';

  if (esMovil && esBaseParaTortas) {
    contenedorMovil.style.display = 'block';
  } else {
    contenedorMovil.style.display = 'none';
  }
}




function filtrarPorForma(productos) {
  if (categoriaActual?.toLowerCase() !== 'base para tortas') return productos;

  const formasSeleccionadas = Array.from(document.querySelectorAll('.checkbox-forma:checked'))
    .map(cb => cb.value.toLowerCase());

  if (formasSeleccionadas.length === 0) return productos;

  return productos.filter(p => {
    if (Array.isArray(p.forma)) {
      return p.forma.some(f => formasSeleccionadas.includes(f.toLowerCase()));
    } else if (typeof p.forma === 'string') {
      return formasSeleccionadas.includes(p.forma.toLowerCase());
    }
    return false;
  });
}


function reiniciarOrden() {
  document.getElementById('ordenar-productos').value = 'relevancia';
}

function ordenarProductos() {
  const select = document.getElementById('ordenar-productos');
  const valor = select.value;
  const contenedor = document.getElementById('contenedor-productos');
  const productosDOM = Array.from(contenedor.children);

  contenedor.classList.add('fade-out');

  setTimeout(() => {
    const productosDOM = Array.from(contenedor.children);

  productosDOM.sort((a, b) => {
    const nombreA = a.querySelector('.nombre-producto').textContent.toLowerCase();
    const nombreB = b.querySelector('.nombre-producto').textContent.toLowerCase();
    const precioA = parseFloat((a.querySelector('.precio-oferta') || a.querySelector('.precio-producto')).textContent.replace('S/ ', ''));
    const precioB = parseFloat((b.querySelector('.precio-oferta') || b.querySelector('.precio-producto')).textContent.replace('S/ ', ''));

    switch (valor) {
      case 'nombreAZ': return nombreA.localeCompare(nombreB);
      case 'nombreZA': return nombreB.localeCompare(nombreA);
      case 'precioAsc': return precioA - precioB;
      case 'precioDesc': return precioB - precioA;
      default: return 0;
    }
  });

  contenedor.innerHTML = '';
  productosDOM.forEach(producto => contenedor.appendChild(producto));
    contenedor.classList.remove('fade-out');
    contenedor.classList.add('fade-in');

    setTimeout(() => {
      contenedor.classList.remove('fade-in');
    }, 300);
  }, 300); 
}

function buscarProductos(termino) {
  if (!productosGlobales.length) return [];
  return productosGlobales.filter(producto => 
    producto.nombre.toLowerCase().includes(termino.toLowerCase()) || 
    producto.categoria.toLowerCase().includes(termino.toLowerCase())
  );
}

function mostrarResultadosBusqueda(resultados, termino) {
  const contenedor = document.getElementById('contenedor-productos');
  const tituloCategoria = document.getElementById('titulo-categoria');

  contenedor.classList.add('fade-out');

  setTimeout(() => {
    contenedor.innerHTML = '';
    tituloCategoria.textContent = `Resultados de "${termino}"`;

    if (resultados.length === 0) {
      contenedor.innerHTML = '<p class="sin-productos">No se encontraron productos.</p>';
    } else {
      resultados.forEach(producto => {
        const descuento = producto.oferta 
          ? Math.round(((producto.precio - producto.precioOferta) / producto.precio) * 100)
          : 0;

        contenedor.innerHTML += `
          <div class="tarjeta-producto">
            ${producto.unidad ? `<span class="badge-unidad">${producto.unidad}</span>` : ''}
            ${producto.oferta ? `<span class="badge-descuento">-${descuento}%</span>` : ''}
            ${producto.destacado ? '<span class="badge-destacado">Destacado</span>' : ''}
            ${producto.especial ? '<span class="badge-especial"><i class="fas fa-star"></i></span>' : ''}
            <img src="${producto.imagen}" alt="${producto.nombre}" loading="lazy">
            <div class="info-producto">
              <div class="nombre-producto">${producto.nombre}</div>
              <div class="precio-container">
                ${producto.oferta ? `<span class="precio-original">S/ ${producto.precio.toFixed(2)}</span>` : ''}
                <span class="${producto.oferta ? 'precio-oferta' : 'precio-producto'}">
                  S/ ${producto.oferta ? producto.precioOferta.toFixed(2) : producto.precio.toFixed(2)}
                </span>
              </div>
            </div>
          </div>`;
      });
    }

    contenedor.classList.remove('fade-out');
    contenedor.classList.add('fade-in');
    setTimeout(() => contenedor.classList.remove('fade-in'), 500);
  }, 300); 
}

function configurarBusqueda() {
  const inputBuscar = document.getElementById('input-buscar');
  const resultadosDiv = document.getElementById('resultados-busqueda');
  const btnBuscar = document.getElementById('btn-buscar');

  inputBuscar.addEventListener('input', function(e) {
    const termino = e.target.value.trim();
    resultadosDiv.innerHTML = '';
    
    if (termino.length < 2) {
      resultadosDiv.style.display = 'none';
      return;
    }
    
    const resultados = buscarProductos(termino);
      
    if (resultados.length > 0) {
      resultados.forEach(producto => {
        const item = document.createElement('div');
        item.className = 'resultado-item';
        item.innerHTML = `
          <div style="display: flex; align-items: center; gap: 10px;">
            <img src="${producto.imagen}" alt="${producto.nombre}" style="width: 50px; height: 50px; object-fit: contain; border-radius: 4px;">
            <div style="flex: 1;">
              <div style="font-weight: bold; font-size: 0.9em;">${producto.nombre}</div>
              <div style="display: flex; align-items: center; gap: 5px; flex-wrap: wrap;">
                ${producto.oferta ? `<span style="text-decoration: line-through; color: #999; font-size: 0.8em;">S/ ${producto.precio.toFixed(2)}</span>` : ''}
                <span style="color: ${producto.oferta ? '#e74c3c' : '#8e44ad'}; font-weight: bold; font-size: 0.9em;">
                  S/ ${producto.oferta ? producto.precioOferta.toFixed(2) : producto.precio.toFixed(2)}
                </span>
                ${producto.oferta ? `<span style="background: #2ecc71; color: white; padding: 2px 5px; border-radius: 3px; font-size: 0.7em; margin-left: 5px;">-${Math.round((producto.precio - producto.precioOferta) / producto.precio * 100)}%</span>` : ''}
              </div>
            </div>
          </div>`;
        
        item.addEventListener('click', (event) => {
          event.stopPropagation();
          mostrarResultadosBusqueda([producto], producto.nombre);
          resultadosDiv.style.display = 'none';
          inputBuscar.value = producto.nombre;
        });
        resultadosDiv.appendChild(item);
      });
      resultadosDiv.style.display = 'block';
    } else {
      resultadosDiv.innerHTML = '<div class="resultado-item">No se encontraron productos</div>';
      resultadosDiv.style.display = 'block';
    }
  });
  
  btnBuscar.addEventListener('click', function() {
    const termino = inputBuscar.value.trim();
    if (termino.length > 0) {
      const resultados = buscarProductos(termino);
      mostrarResultadosBusqueda(resultados, termino);
      resultadosDiv.style.display = 'none';
      scrollToTop(); 
    }
  });
  
  document.addEventListener('click', function(e) {
    if (!e.target.closest('.contenedor-busqueda')) {
      resultadosDiv.style.display = 'none';
    }
  });
  
  inputBuscar.addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && inputBuscar.value.trim().length > 0) {
      const termino = inputBuscar.value.trim();
      const resultados = buscarProductos(termino);
      mostrarResultadosBusqueda(resultados, termino);
      resultadosDiv.style.display = 'none';
      scrollToTop(); 
    }
  });
}

function configurarSecciones() {
  document.querySelectorAll('.seccion-item').forEach(item => {
    item.addEventListener('click', function() {
      if (seccionActual === this.dataset.seccion) {
        seccionActual = null;
        categoriaActual = null;
        document.querySelectorAll('.seccion-item, .categoria-item').forEach(i => i.classList.remove('activo', 'activa'));
        document.querySelector('.categoria-item:first-child').classList.add('activa');
        document.getElementById('titulo-categoria').textContent = 'Todos los Productos';
      } else {
        seccionActual = this.dataset.seccion;
        categoriaActual = null;
        const titulosSecciones = {
          'destacados': 'Productos Destacados',
          'ofertas': 'Super Ofertas',
          'especiales': 'Productos Especiales'
        };
        document.getElementById('titulo-categoria').textContent = titulosSecciones[seccionActual];
      }
      
      resetearFiltros();
      document.querySelectorAll('.seccion-item, .categoria-item').forEach(i => i.classList.remove('activo', 'activa'));
      if (seccionActual) {
        this.classList.add('activo');
      } else {
        document.querySelector('.categoria-item:first-child').classList.add('activa');
      }
      
      mostrarProductos();
      cerrarMenuCategorias();
      scrollToTop();
      controlarFiltroFormaMovil();
    });
  });

  document.querySelectorAll('.categoria-item:first-child').forEach(item => {
    item.addEventListener('click', function() {
      seccionActual = null;
      categoriaActual = null;
      resetearFiltros();
      mostrarProductos();
      controlarFiltroFormaMovil();
      scrollToTop();
      document.getElementById('titulo-categoria').textContent = 'Todos los Productos';
      document.querySelectorAll('.categoria-item, .seccion-item').forEach(i => i.classList.remove('activa', 'activo'));
      this.classList.add('activa');
      cerrarMenuCategorias();
    });
  });
}

function toggleMenuCategorias() {
  const sidebar = document.getElementById('sidebar-categorias');
  const overlay = document.getElementById('overlay-sidebar');
  
  sidebar.classList.add('visible');
  overlay.classList.add('visible');
  sidebar.classList.remove('oculto');
  overlay.classList.remove('oculto');

  document.body.style.overflow = 'hidden';  
}

function cerrarMenuCategorias() {
  const sidebar = document.getElementById('sidebar-categorias');
  const overlay = document.getElementById('overlay-sidebar');

  sidebar.classList.remove('visible');
  overlay.classList.remove('visible');

  document.body.style.overflow = 'auto';

  setTimeout(() => {
    sidebar.classList.add('oculto');
    overlay.classList.add('oculto');

  }, 300);
}

document.addEventListener('DOMContentLoaded', async function() {
  if (typeof noUiSlider === 'undefined') {
    console.error('noUiSlider no está cargado');
    return;
  }

  await cargarProductos();
  cargarCategorias();
  inicializarSliderPrecio();
  configurarBusqueda();
  configurarSecciones();
  
  document.getElementById('ordenar-productos').addEventListener('change', ordenarProductos);
  mostrarProductos();
  controlarFiltroFormaMovil();
});

  function mostrarFiltroFormasBase(categoria) {
    const filtroFormas = document.getElementById('filtro-formas-base');
    const filtroMovil = document.getElementById('contenedor-forma-movil');
    const esBaseTorta = categoria && categoria.trim().toLowerCase() === 'base para tortas';

    if (filtroFormas) filtroFormas.classList.toggle('oculto', !esBaseTorta);
    if (filtroMovil) filtroMovil.style.display = esBaseTorta ? 'block' : 'none';
  }

  function obtenerFormasSeleccionadas() {
    return Array.from(document.querySelectorAll('.checkbox-forma:checked'))
      .map(cb => cb.value);
  }

  const originalMostrarProductos = mostrarProductos;
  mostrarProductos = function () {
    originalMostrarProductos();
    mostrarFiltroFormasBase(categoriaActual);
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.checkbox-forma').forEach(cb => {
      cb.addEventListener('change', mostrarProductos);
    });

    const filtroFormaMovil = document.getElementById('filtro-forma-movil');
    if (filtroFormaMovil) {
      filtroFormaMovil.addEventListener('change', () => {
        document.querySelectorAll('.checkbox-forma').forEach(cb => cb.checked = false);
        const valor = filtroFormaMovil.value;
        if (valor) {
          const checkbox = Array.from(document.querySelectorAll('.checkbox-forma'))
            .find(cb => cb.value === valor);
          if (checkbox) checkbox.checked = true;
        }
        mostrarProductos();
      });
    }
  });

  const originalFiltrar = typeof filtrarProductos === 'function' ? filtrarProductos : p => p;
  function filtrarProductos(productos) {
    let filtrados = originalFiltrar(productos);
    if (categoriaActual?.toLowerCase() === 'base para tortas') {
      const formasSeleccionadas = obtenerFormasSeleccionadas();
      if (formasSeleccionadas.length > 0) {
        filtrados = filtrados.filter(p => formasSeleccionadas.includes(p.forma));
      }
    }
    return filtrados;
  }




function toggleBotonSubir() {
  const botonSubir = document.getElementById('boton-subir');
  if (window.scrollY > 300) {
    botonSubir.classList.add('visible');
  } else {
    botonSubir.classList.remove('visible');
  }
}

function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
}

document.addEventListener('DOMContentLoaded', function() {
  if (!document.getElementById('boton-subir')) {
    const botonSubir = document.createElement('button');
    botonSubir.id = 'boton-subir';
    botonSubir.className = 'boton-subir';
    botonSubir.title = 'Volver arriba';
    botonSubir.innerHTML = '<i class="fas fa-chevron-up"></i>'; /* Flecha más estética */
    botonSubir.setAttribute('aria-label', 'Volver al inicio de la página');
    botonSubir.onclick = scrollToTop;
    document.body.appendChild(botonSubir);
  }
  
  window.addEventListener('scroll', toggleBotonSubir);
  
  toggleBotonSubir();
});
