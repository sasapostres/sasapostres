        document.addEventListener('DOMContentLoaded', function() {
        const imagenes = document.querySelectorAll('.imagen-carrusel');
        const boton = document.querySelector('.boton-todos');
        let indiceActual = 0;

        function cambiarImagenYColor() {
        imagenes[indiceActual].classList.remove('activa');
        
        indiceActual = (indiceActual + 1) % imagenes.length;
        
        imagenes[indiceActual].classList.add('activa');
        const nuevoColor = imagenes[indiceActual].getAttribute('data-color');
        boton.style.backgroundColor = nuevoColor;
        }

        setInterval(cambiarImagenYColor, 3000);
        });

   document.addEventListener('DOMContentLoaded', function() {
      
      const contenedor = document.querySelector('.texto-rotativo-container');
      
      mensajes.forEach((mensaje, index) => {
        const span = document.createElement('span');
        span.className = 'texto-rotativo';
        span.textContent = mensaje;
        span.style.animationDelay = `${index * 4}s`;
        contenedor.appendChild(span);
      });
      
      let currentIndex = 0;
      
      function siguienteMensaje() {
        const textos = document.querySelectorAll('.texto-rotativo');
        textos.forEach(text => text.style.opacity = '0');
        
        textos[currentIndex].style.opacity = '1';
        textos[currentIndex].style.transform = 'translateX(0)';
        
        setTimeout(() => {
          textos[currentIndex].style.opacity = '0';
          textos[currentIndex].style.transform = 'translateX(-30px)';
        }, 3000);
        
        currentIndex = (currentIndex + 1) % textos.length;
      }
      
      setInterval(siguienteMensaje, 4000);
      siguienteMensaje();
    });

    let productosGlobales = [];

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

  function mostrarCatalogo(categoria) {
    let nombreCategoria = categoria;
    if (categoria === 'base_torta') {
      nombreCategoria = 'Base para Tortas';
    } else {
      nombreCategoria = categoria.charAt(0).toUpperCase() + categoria.slice(1);
    }
    
    window.location.href = `todos-productos.html?categoria=${encodeURIComponent(categoria)}`;
  }

  function buscarProductos(termino) {
    if (!productosGlobales.length) return [];
    return productosGlobales.filter(producto => 
      producto.nombre.toLowerCase().includes(termino.toLowerCase()) || 
      producto.categoria.toLowerCase().includes(termino.toLowerCase())
    );
  }

  function configurarBusqueda() {
    const inputBuscar = document.getElementById('input-buscar');
    const resultadosDiv = document.getElementById('resultados-busqueda');

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

  document.getElementById('btn-buscar').addEventListener('click', function() {
    const termino = document.getElementById('input-buscar').value.trim();
    if (termino.length > 0) {
      window.location.href = `resultados-busqueda.html?q=${encodeURIComponent(termino)}`;
    }
  });

  document.addEventListener('DOMContentLoaded', async function() {
    await cargarProductos();
    configurarBusqueda();
      });

document.addEventListener('DOMContentLoaded', function() {
  const carrusel = document.querySelector('.cinta-categorias');
  const flechaIzquierda = document.querySelector('.flecha-izquierda');
  const flechaDerecha = document.querySelector('.flecha-derecha');
  const tarjetas = document.querySelectorAll('.tarjeta-categoria');
  const contenedorPuntos = document.querySelector('.puntos-navegacion');
  
  let currentIndex = 0;
  let isDragging = false;
  let startX, scrollLeft;
  let autoScrollInterval;
  
  function crearPuntosNavegacion() {
    contenedorPuntos.innerHTML = '';
    tarjetas.forEach((_, index) => {
      const punto = document.createElement('div');
      punto.className = 'punto-navegacion';
      punto.dataset.index = index;
      punto.addEventListener('click', () => irAPagina(index));
      contenedorPuntos.appendChild(punto);
    });
    actualizarPuntos();
  }
  
  function actualizarPuntos() {
    document.querySelectorAll('.punto-navegacion').forEach((punto, index) => {
      punto.classList.toggle('activo', index === currentIndex);
    });
  }
  
  function irAPagina(index) {
    currentIndex = index;
    carrusel.scrollTo({
      left: tarjetas[0].offsetWidth * index,
      behavior: 'smooth'
    });
    actualizarPuntos();
    reiniciarAutoScroll();
  }
  
  function navegar(direction) {
    if (isDragging) return;

    if (direction === 'left') {
      currentIndex = (currentIndex - 1 + tarjetas.length) % tarjetas.length;
    } else {
      currentIndex = (currentIndex + 1) % tarjetas.length;
    }

    irAPagina(currentIndex);
  }
  
  function iniciarAutoScroll() {
    autoScrollInterval = setInterval(() => {
      if (!isDragging) {
        navegar('right');
      }
    }, 5000);
  }
  
  function reiniciarAutoScroll() {
    clearInterval(autoScrollInterval);
    iniciarAutoScroll();
  }
  
  flechaIzquierda.addEventListener('click', () => navegar('left'));
  flechaDerecha.addEventListener('click', () => navegar('right'));
  
  carrusel.addEventListener('touchstart', (e) => {
    isDragging = true;
    startX = e.touches[0].pageX - carrusel.offsetLeft;
    scrollLeft = carrusel.scrollLeft;
    reiniciarAutoScroll();
  }, { passive: true });
  
  carrusel.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.touches[0].pageX - carrusel.offsetLeft;
    const walk = (x - startX) * 2;
    carrusel.scrollLeft = scrollLeft - walk;
  }, { passive: false });
  
  carrusel.addEventListener('touchend', () => {
    isDragging = false;

    const cardWidth = tarjetas[0].offsetWidth;
    const scrollLeft = carrusel.scrollLeft;
    const scrollMax = carrusel.scrollWidth - carrusel.offsetWidth;

    if (scrollLeft >= scrollMax - 5) {
      setTimeout(() => {
        currentIndex = 0;
        carrusel.scrollTo({ left: 0, behavior: 'instant' });
        actualizarPuntos();
      }, 100);
    } else if (scrollLeft <= 5) {
      setTimeout(() => {
        currentIndex = tarjetas.length - 1;
        carrusel.scrollTo({
          left: cardWidth * (tarjetas.length - 1),
          behavior: 'instant'
        });
        actualizarPuntos();
      }, 100);
    } else {
      currentIndex = Math.round(scrollLeft / cardWidth);
      actualizarPuntos();
    }

    reiniciarAutoScroll();
  });
  
  carrusel.addEventListener('scroll', () => {
    const cardWidth = tarjetas[0].offsetWidth;
    const scrollLeft = carrusel.scrollLeft;

    const nuevoIndex = Math.round(scrollLeft / cardWidth);
    if (nuevoIndex !== currentIndex) {
      currentIndex = nuevoIndex;
      actualizarPuntos();
    }
  });

  crearPuntosNavegacion();
  iniciarAutoScroll();
  
  carrusel.addEventListener('mouseenter', () => clearInterval(autoScrollInterval));
  carrusel.addEventListener('mouseleave', reiniciarAutoScroll);
  
  window.addEventListener('resize', () => {
    const cardWidth = tarjetas[0].offsetWidth;
    currentIndex = Math.round(carrusel.scrollLeft / cardWidth);
    actualizarPuntos();
  });
});

  document.addEventListener('DOMContentLoaded', function() {
    const encabezadoImagenes = document.querySelectorAll('.encabezado-imagen');
    const encabezadoControles = document.querySelectorAll('.encabezado-control');
    let encabezadoIndiceActual = 0;
    let encabezadoIntervalo;

    function cambiarImagenEncabezado(nuevoIndice) {
      encabezadoImagenes[encabezadoIndiceActual].classList.remove('activa');
      encabezadoControles[encabezadoIndiceActual].classList.remove('activo');
      
      encabezadoIndiceActual = (nuevoIndice + encabezadoImagenes.length) % encabezadoImagenes.length;
      
      encabezadoImagenes[encabezadoIndiceActual].classList.add('activa');
      encabezadoControles[encabezadoIndiceActual].classList.add('activo');
      
      reiniciarIntervaloEncabezado();
    }

    function avanzarEncabezado() {
      cambiarImagenEncabezado(encabezadoIndiceActual + 1);
    }

    function reiniciarIntervaloEncabezado() {
      clearInterval(encabezadoIntervalo);
      encabezadoIntervalo = setInterval(avanzarEncabezado, 5000);
    }

    encabezadoControles.forEach(control => {
      control.addEventListener('click', function() {
        const indice = parseInt(this.getAttribute('data-index'));
        cambiarImagenEncabezado(indice);
      });
    });

    encabezadoControles[0].classList.add('activo');
    reiniciarIntervaloEncabezado();

    const urlParams = new URLSearchParams(window.location.search);
    const categoria = urlParams.get('categoria');
    if (categoria) {
      const titulo = document.getElementById('titulo-dinamico');
      titulo.textContent = `Productos: ${categoria.charAt(0).toUpperCase() + categoria.slice(1)}`;
    }
  });

  document.addEventListener('DOMContentLoaded', function() {
    const carrusel = document.querySelector('.encabezado-carrusel');
    const slides = document.querySelectorAll('.encabezado-slide');
    const controles = document.querySelectorAll('.encabezado-control');
    let currentIndex = 0;
    let intervalo;
    const totalSlides = slides.length;

    function moverCarrusel(nuevoIndice) {
      currentIndex = (nuevoIndice + totalSlides) % totalSlides;
      
      carrusel.style.transform = `translateX(-${currentIndex * 33.3333}%)`;
      
      controles.forEach((control, index) => {
        control.classList.toggle('activo', index === currentIndex);
      });
      
      reiniciarIntervalo();
    }

    function siguienteSlide() {
      moverCarrusel(currentIndex + 1);
    }

    function reiniciarIntervalo() {
      clearInterval(intervalo);
      intervalo = setInterval(siguienteSlide, 5000);
    }

    controles.forEach(control => {
      control.addEventListener('click', function() {
        const indice = parseInt(this.getAttribute('data-index'));
        moverCarrusel(indice);
      });
    });

    controles[0].classList.add('activo');
    reiniciarIntervalo();

  });

let todosDestacados = [];

async function mostrarProductosDestacados() {
    try {
      const response = await fetch('productos.json');
      const data = await response.json();
      todosDestacados = data.productos.filter(producto => producto.destacado === true);
      const primeros5Destacados = todosDestacados.slice(0, 5);

      const contenedor = document.getElementById('contenedor-destacados');
      contenedor.innerHTML = '';

      if (primeros5Destacados.length === 0) {
        contenedor.innerHTML = '<p class="sin-productos">No hay productos destacados disponibles.</p>';
        document.getElementById('boton-ver-mas').style.display = 'none';
        return;
      }

      primeros5Destacados.forEach(producto => {
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

      document.getElementById('boton-ver-mas').style.display = 
        todosDestacados.length > 5 ? 'inline-block' : 'none';

    } catch (error) {
      console.error('Error al cargar productos destacados:', error);
      const contenedor = document.getElementById('contenedor-destacados');
      contenedor.innerHTML = '<p class="sin-productos">Error al cargar productos destacados.</p>';
    }
  }

  function configurarBotonVerMas() {
    const boton = document.getElementById('boton-ver-mas');
    if (boton) {
      boton.addEventListener('click', function() {
        window.location.href = 'resultados-busqueda.html?destacados=true';
      });
    }
  }

  document.addEventListener('DOMContentLoaded', function() {
    mostrarProductosDestacados();
    configurarBotonVerMas();
  });



    let todosOfertas = [];

    async function mostrarProductosOferta() {
      try {
        const response = await fetch('productos.json');
        const data = await response.json();
        todosOfertas = data.productos.filter(producto => producto.oferta === true);
        const primeros5Ofertas = todosOfertas.slice(0, 5);

        const contenedor = document.getElementById('contenedor-ofertas');
        contenedor.innerHTML = '';

        if (primeros5Ofertas.length === 0) {
          contenedor.innerHTML = '<p class="sin-productos">No hay productos en oferta disponibles.</p>';
          document.getElementById('boton-ver-mas-ofertas').style.display = 'none';
          return;
        }

        primeros5Ofertas.forEach(producto => {
          const descuento = Math.round(((producto.precio - producto.precioOferta) / producto.precio) * 100);

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

        document.getElementById('boton-ver-mas-ofertas').style.display = 
          todosOfertas.length > 5 ? 'inline-block' : 'none';

      } catch (error) {
        console.error('Error al cargar productos en oferta:', error);
      }
    }

    function configurarBotonVerMasOfertas() {
      const boton = document.getElementById('boton-ver-mas-ofertas');
      if (boton) {
        boton.addEventListener('click', function() {
          window.location.href = 'resultados-busqueda.html?ofertas=true';
        });
      }
    }

    document.addEventListener('DOMContentLoaded', function() {
      mostrarProductosOferta();
      configurarBotonVerMasOfertas();
    });
  let todosEspeciales = [];

  async function mostrarProductosEspeciales() {
    try {
      const response = await fetch('productos.json');
      const data = await response.json();
      todosEspeciales = data.productos.filter(producto => producto.especial === true);
      const primeros5Especiales = todosEspeciales.slice(0, 5);

      const contenedor = document.getElementById('contenedor-especiales');
      contenedor.innerHTML = '';

      if (primeros5Especiales.length === 0) {
        contenedor.innerHTML = '<p class="sin-productos">No hay productos especiales disponibles.</p>';
        document.getElementById('boton-ver-mas-especiales').style.display = 'none';
        return;
      }

      primeros5Especiales.forEach(producto => {
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

      document.getElementById('boton-ver-mas-especiales').style.display = 
        todosEspeciales.length > 5 ? 'inline-block' : 'none';

    } catch (error) {
      console.error('Error al cargar productos especiales:', error);
    }
  }

  function configurarBotonVerMasEspeciales() {
    const boton = document.getElementById('boton-ver-mas-especiales');
    if (boton) {
      boton.addEventListener('click', function() {
        window.location.href = 'resultados-busqueda.html?especiales=true';
      });
    }
  }

  document.addEventListener('DOMContentLoaded', function() {
    mostrarProductosEspeciales();
    configurarBotonVerMasEspeciales();
  });

  let menuState = 'main'; 

function toggleMenuCategorias() {
  const sidebar = document.getElementById('sidebar-categorias');
  const overlay = document.getElementById('overlay-sidebar');
  
  sidebar.classList.add('visible');
  overlay.classList.add('visible');
  sidebar.classList.remove('oculto');
  overlay.classList.remove('oculto');
  
  document.body.style.overflow = 'hidden';
  
  cargarMenuCompleto();
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

async function cargarMenuCompleto() {
  try {
    const response = await fetch('productos.json');
    const data = await response.json();
    const productos = data.productos;

    const listaCategorias = document.getElementById('menu-categorias');
    listaCategorias.innerHTML = '';

    const itemTodos = document.createElement('div');
    itemTodos.className = 'categoria-item';
    itemTodos.innerHTML = '<i class="fas fa-box-open"></i> Todos los productos';
    itemTodos.onclick = () => {
      window.location.href = 'todos-productos.html';
      cerrarMenuCategorias();
    };
    listaCategorias.appendChild(itemTodos);

    const categoriasUnicas = [...new Set(productos.map(p => p.categoria.trim()))]
      .sort((a, b) => a.localeCompare(b));
    
    categoriasUnicas.forEach(cat => {
      const item = document.createElement('div');
      item.className = 'categoria-item';
      item.innerHTML = `
        <i class="fas fa-folder"></i>
        <span class="categoria-nombre">${capitalizar(cat)}</span>
      `;
      item.onclick = () => {
        window.location.href = `todos-productos.html?categoria=${encodeURIComponent(cat)}`;
        cerrarMenuCategorias();
      };
      listaCategorias.appendChild(item);
    });

    document.querySelectorAll('.seccion-item').forEach(item => {
      item.addEventListener('click', function() {
        const seccion = this.getAttribute('data-seccion');
        cerrarMenuCategorias();
        
        switch(seccion) {
          case 'destacados':
            window.location.href = 'resultados-busqueda.html?destacados=true';
            break;
          case 'ofertas':
            window.location.href = 'resultados-busqueda.html?ofertas=true';
            break;
          case 'especiales':
            window.location.href = 'resultados-busqueda.html?especiales=true';
            break;
        }
      });
    });

  } catch (err) {
    console.error('Error al cargar el menú:', err);
    listaCategorias.innerHTML = '<div class="error-carga">No se pudieron cargar las categorías</div>';
  }
}

  function capitalizar(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  document.addEventListener('DOMContentLoaded', () => {
    actualizarMenu();
  });
