//<script>
  // Variable global para los productos
  let productosGlobales = [];
  let productosFiltrados = [];

  // Función para cargar productos
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

  // Función para ordenar productos
  function ordenarProductos() {
    const select = document.getElementById('ordenar-productos');
    const valor = select.value;
    const contenedor = document.getElementById('resultados-grid');
    const productosDOM = Array.from(contenedor.children);

  // Aplica animación de salida
  contenedor.classList.add('fade-out');

  // Espera la transición antes de aplicar orden
  setTimeout(() => {
    const productosDOM = Array.from(contenedor.children);

    productosDOM.sort((a, b) => {
      const nombreA = a.querySelector('.nombre-producto').textContent.toLowerCase();
      const nombreB = b.querySelector('.nombre-producto').textContent.toLowerCase();
      
      const precioElementoA = a.querySelector('.precio-oferta') || a.querySelector('.precio-producto');
      const precioElementoB = b.querySelector('.precio-oferta') || b.querySelector('.precio-producto');
      
      const precioA = parseFloat(precioElementoA.textContent.replace('S/ ', ''));
      const precioB = parseFloat(precioElementoB.textContent.replace('S/ ', ''));

      switch (valor) {
        case 'nombreAZ': return nombreA.localeCompare(nombreB);
        case 'nombreZA': return nombreB.localeCompare(nombreA);
        case 'precioAsc': return precioA - precioB;
        case 'precioDesc': return precioB - precioA;
        default: return 0;
      }
    });

    // Limpiamos el contenedor
    contenedor.innerHTML = '';
    
    // Volvemos a agregar los productos ordenados
    productosDOM.forEach(producto => contenedor.appendChild(producto));
  
        // Aplica animación de entrada
    contenedor.classList.remove('fade-out');
    contenedor.classList.add('fade-in');

    // Limpia la clase para futuras transiciones
    setTimeout(() => {
      contenedor.classList.remove('fade-in');
    }, 300);
  }, 300); // tiempo del fade-out
  }

  // Función para mostrar resultados
async function mostrarResultados() {
  const urlParams = new URLSearchParams(window.location.search);
  const mostrarTodosDestacados = urlParams.get('destacados') === 'true';
  const mostrarTodasOfertas = urlParams.get('ofertas') === 'true';
  const mostrarTodosEspeciales = urlParams.get('especiales') === 'true';

  // Cargar productos
  const productos = await cargarProductos();
  
  // Filtrar productos según el caso
  let resultados = [];
  if (mostrarTodosDestacados) {
    resultados = productos.filter(p => p.destacado === true);
  } else if (mostrarTodasOfertas) {
    resultados = productos.filter(p => p.oferta === true);
  } else if (mostrarTodosEspeciales) {
    resultados = productos.filter(p => p.especial === true);
  } else {
    const termino = urlParams.get('q') || '';
    resultados = productos.filter(p => {
      return (
        p.nombre.toLowerCase().includes(termino.toLowerCase()) || 
        p.categoria.toLowerCase().includes(termino.toLowerCase())
      );
    });
  }

  // Actualizar el título
  const titulo = document.getElementById('titulo-busqueda');
  if (mostrarTodosDestacados) {
    titulo.textContent = 'Productos Destacados';
  } else if (mostrarTodasOfertas) {
    titulo.textContent = 'Super Ofertas';
  } else if (mostrarTodosEspeciales) {
    titulo.textContent = 'Días Especiales';
  } else {
    const termino = urlParams.get('q') || '';
    titulo.textContent = termino 
      ? `Resultados para "${termino}"` 
      : 'Resultados de búsqueda';
  }

  // Mostrar resultados
  const resultadosGrid = document.getElementById('resultados-grid');
  const sinResultados = document.getElementById('sin-resultados');
  const contador = document.getElementById('contador-resultados');
  
  resultadosGrid.innerHTML = '';
  
  if (resultados.length > 0) {
    contador.textContent = `${resultados.length} ${resultados.length === 1 ? 'producto' : 'productos'} encontrado${resultados.length === 1 ? '' : 's'}`;
    
    resultados.forEach(producto => {
      const descuento = producto.oferta 
        ? Math.round(((producto.precio - producto.precioOferta) / producto.precio) * 100)
        : 0;
      
      const esEspecial = mostrarTodosEspeciales || producto.especial;
      
      resultadosGrid.innerHTML += `
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
    
    sinResultados.style.display = 'none';
  } else {
    resultadosGrid.style.display = 'none';
    sinResultados.style.display = 'block';
    contador.textContent = '0 productos encontrados';
  }
}





  

// Funciones para el menú de categorías
function toggleMenuCategorias() {
  const sidebar = document.getElementById('sidebar-categorias');
  const overlay = document.getElementById('overlay-sidebar');
  
  sidebar.classList.add('visible');
  overlay.classList.add('visible');
  sidebar.classList.remove('oculto');
  overlay.classList.remove('oculto');
  
  // Bloquear scroll de la página principal
  document.body.style.overflow = 'hidden';

  cargarMenuCompleto();
}

function cerrarMenuCategorias() {
  const sidebar = document.getElementById('sidebar-categorias');
  const overlay = document.getElementById('overlay-sidebar');

  sidebar.classList.remove('visible');
  overlay.classList.remove('visible');

  // Restaurar scroll de la página principal
  document.body.style.overflow = 'auto';  

  setTimeout(() => {
    sidebar.classList.add('oculto');
    overlay.classList.add('oculto');
  }, 300);
}

async function cargarMenuCompleto() {
  try {
    const response = await fetch('productos.json');
    const data = await response.json();
    const productos = data.productos;

    const listaCategorias = document.getElementById('menu-categorias');
    listaCategorias.innerHTML = '';

    // Añadir "Todos los productos"
    const itemTodos = document.createElement('div');
    itemTodos.className = 'categoria-item';
    itemTodos.innerHTML = '<i class="fas fa-box-open"></i> Todos los productos';
    itemTodos.onclick = () => {
      window.location.href = 'todos-productos.html';
      cerrarMenuCategorias();
    };
    listaCategorias.appendChild(itemTodos);

    // Cargar categorías
    const categoriasUnicas = [...new Set(productos.map(p => p.categoria.trim()))]
      .sort((a, b) => a.localeCompare(b));
    
    categoriasUnicas.forEach(cat => {
      const item = document.createElement('div');
      item.className = 'categoria-item';
      item.innerHTML = `<i class="fas fa-folder"></i> ${cat.charAt(0).toUpperCase() + cat.slice(1)}`;
      item.onclick = () => {
        window.location.href = `todos-productos.html?categoria=${encodeURIComponent(cat)}`;
        cerrarMenuCategorias();
      };
      listaCategorias.appendChild(item);
    });

    // Configurar secciones especiales
    document.querySelectorAll('.seccion-item').forEach(item => {
      item.addEventListener('click', function() {
        const seccion = this.getAttribute('data-seccion');
        cerrarMenuCategorias();
        window.location.href = `resultados-busqueda.html?${seccion}=true`;
      });
    });

  } catch (err) {
    console.error('Error al cargar el menú:', err);
  }
}

// Configurar búsqueda
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
        
        item.addEventListener('click', () => {
          window.location.href = `resultados-busqueda.html?q=${encodeURIComponent(producto.nombre)}`;
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
      window.location.href = `resultados-busqueda.html?q=${encodeURIComponent(termino)}`;
    }
  });
  
  document.addEventListener('click', function(e) {
    if (!e.target.closest('.contenedor-busqueda')) {
      resultadosDiv.style.display = 'none';
    }
  });
  
  inputBuscar.addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && inputBuscar.value.trim().length > 0) {
      window.location.href = `resultados-busqueda.html?q=${encodeURIComponent(inputBuscar.value.trim())}`;
    }
  });
}

// Función auxiliar para buscar productos
function buscarProductos(termino) {
  if (!productosGlobales.length) return [];
  return productosGlobales.filter(producto => 
    producto.nombre.toLowerCase().includes(termino.toLowerCase()) || 
    producto.categoria.toLowerCase().includes(termino.toLowerCase())
  );
}

// Inicializar
document.addEventListener('DOMContentLoaded', async function() {
  await cargarProductos();
  await mostrarResultados();
  configurarBusqueda();
});  
//</script>



//<!-- = SCRIPT PARA SECCION DE FLECHA SUBIR AL PRINCIPIO////-->
//<script>
// Función para mostrar/ocultar el botón según el scroll
function toggleBotonSubir() {
  const botonSubir = document.getElementById('boton-subir');
  if (window.scrollY > 300) {
    botonSubir.classList.add('visible');
  } else {
    botonSubir.classList.remove('visible');
  }
}

// Función para desplazarse suavemente al principio
function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
}

// Inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
  // Crear el botón si no existe
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
  
  // Configurar el evento de scroll
  window.addEventListener('scroll', toggleBotonSubir);
  
  // Comprobar posición inicial
  toggleBotonSubir();
});
//</script>