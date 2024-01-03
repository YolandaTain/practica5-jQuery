$(document).ready(() => init());

function init() {
    getData();

    $("#categoria").on("change", function () {
        filtrarPorCategoria();
    });

    $(".search-button").on("click", function () {
        buscar();
    });

    $(".carrito-button").on("click", function () {
        carritoVacio();
    });

    // Mostrar inicialmente la sección de "Discos Recomendados"
    $('#principal').show();
    $('#recomendados').show();
    $('#footer').show();
    $('#tienda').hide();
    $('#ofertas').hide();
    $('#novedades').hide();
   
    // Manejar clic en enlaces de la barra de navegación
    $('#home-button').click(function () {
        $('#principal').show();
        $('#recomendados').show();
        $('#footer').show();
        $('#tienda').hide();
        $('#ofertas').hide();
        $('#novedades').hide();
    });

    $('#tienda-link').click(function () {
        $('#principal').show();
        $('#recomendados').hide();
        $('#ofertas').hide();
        $('#novedades').hide();
        $('#tienda').show();
        $('#footer').show();
    });

    $('#ofertas-link').click(function () {
        $('#principal').show();
        $('#recomendados').hide();
        $('#tienda').hide();
        $('#novedades').hide();
        $('#ofertas').show();
        $('#footer').show();
    });

    $('#novedades-link').click(function () {
        $('#principal').show();
        $('#recomendados').hide();
        $('#ofertas').hide();
        $('#novedades').show();
        $('#tienda').hide();
        $('#footer').show();
    });
}

var datos;
var menuCarrito = $("#carrito");
var selectedVinilos = [];

function getData() {
    $.ajax({
        url: '/json/productos.json',
        type: 'GET',
        dataType: 'json',
        success: function (jsonData) {
            datos = jsonData.vinilos
            mostrarVinilos(jsonData);
            filtrarPorCategoria(jsonData);
            carousel(jsonData);
            mostrarNovedades(jsonData);
        },
        error: function (xhr, status) {
            console.log('Disculpe, existió un problema al cargar el JSON');
        },
        complete: function (xhr, status) {
            console.log('Petición realizada');
        }
    });
}


function mostrarVinilos(jsonData) {
    const vinilos = jsonData.vinilos;

    const $cardsContainer = $("#cards-container");

    if (!vinilos || vinilos.length === 0 || !$cardsContainer.length) {
        console.error("Datos de vinilos no válidos o contenedor de tarjetas no encontrado.");
        return;
    }

    $cardsContainer.empty();

    // Filtrar vinilos que NO tienen la subcategoría "oferta"
    var vinilosFiltrados = vinilos.filter(vinilo => !(vinilo.subcategoria && vinilo.subcategoria.toLowerCase().includes("oferta")));

    // Mostrar solo las primeras 5 cartas después del shuffle
    const cartasMostradas = vinilosFiltrados.slice(0, 5);

    // Construir y agregar las cartas al contenedor
    $.each(cartasMostradas, function (index, vinilo) {
        var $card = $("<div>").addClass("card").css({
            width: '25rem',
            textAlign: 'center',
            borderRadius: '10px'
        });

        var $img = $("<img>").attr({
            src: vinilo.imagen,
            alt: vinilo.artista
        }).addClass("card-img-top").css({
            width: '25rem',
            borderRadius: '10px'
        });

        var $cardBody = $("<div>").addClass("card-body").css({
            textAlign: 'center',
            marginTop: '1rem',
            marginBottom: '0rem',
            width: '25rem'
        });

        var $title = $("<h5>").addClass("card-title").text(vinilo.artista);

        var $subtitle = $("<p>").addClass("card-text").text(vinilo.album);

        var $precio = $("<p>").addClass("card-precio").text(`${vinilo.precio}€`);

        var $btnAñadirCarrito = $("<button>").addClass("añadir-carrito").text("Añadir").css({
            padding: '1rem',
            width: '15rem',
            fontSize: '1.5rem',
            backgroundColor: '#c9613b',
            borderRadius: '10px',
            transition: 'background-color 0.3s ease',
        })

            .on("click", function () {
                añadir(index, $("#carrito"));
            })

            .on('mouseenter', function () {
                $(this).css('background-color', '#a84728');
            })
            .on('mouseleave', function () {
                $(this).css('background-color', '#c9613b');
            });

        $cardBody.append($title, $subtitle, $precio, $btnAñadirCarrito);
        $card.append($img, $cardBody);
        $cardsContainer.append($card);
    });

    $cardsContainer.css('padding', '5rem');
}


function filtrarPorCategoria() {
    var vinilos = datos;
    var filtroCategoria = $("#categoria").val();
    var resultadosDiv = $("#resultadosFiltro");

    var vinilosFiltrados;

    if (filtroCategoria === "todas") {
        vinilosFiltrados = vinilos;
    } else {
        // Filtrar los vinilos que NO tienen la subcategoría "oferta"
        vinilosFiltrados = vinilos.filter(function (vinilo) {
            var tieneOferta = vinilo.subcategoria && vinilo.subcategoria.includes("oferta");
            return (Array.isArray(vinilo.categoria) ? vinilo.categoria.includes(filtroCategoria) : vinilo.categoria === filtroCategoria) && !tieneOferta;
        });
    }

    resultadosDiv.empty();
    if (vinilosFiltrados.length === 0) {
        resultadosDiv.html("<p>No hay vinilos en esta categoría.</p>");
    } else {
        // Crear una fila (row) para el contenedor de tarjetas
        var $fila = $("<div>").addClass("row");

        vinilosFiltrados.forEach((vinilo, index) => {
            const categoriasTexto = Array.isArray(vinilo.categoria) ? vinilo.categoria.join(", ") : vinilo.categoria;

            // Crear una tarjeta con la información del vinilo
            var $tarjeta = $("<div>").addClass("tarjeta col-12 col-md-6 col-lg-4 mb-3");

            $tarjeta.html(`
                <div class="row fila">
                    <img class="tarjeta-img-top" src="${vinilo.imagen}" alt="Card image cap">
                    <div class="tarjeta-body text-center">
                        <h5 class="tarjeta-text">${vinilo.artista}</h5>
                        <p class="tarjeta-album">${vinilo.album}</p>
                        <p class="tarjeta-text">${vinilo.precio}€</p>
                        <button type="button" class="añadir-carrito btn btn-outline-dark"
                            style="padding: 1rem; width: 100%; font-size: 1.5rem;">Añadir</button>
                    </div>
                </div>
            `)
                .on("click", function () {
                    añadir(index, $("#carrito"));
                });

            // Agregar la tarjeta a la fila
            $fila.append($tarjeta);
        });

        // Agregar la fila al contenedor de resultados
        resultadosDiv.append($fila);
    }
}


function carousel(jsonData) {
    var vinilos = jsonData.vinilos;
    var $slickCarouselContainer = $("#slick-carousel");

    if (!vinilos || vinilos.length === 0 || !$slickCarouselContainer.length) {
        console.error("Datos de vinilos no válidos o contenedor de carrusel no encontrado.");
        return;
    }

    $slickCarouselContainer.empty();

    // Filtrar vinilos que tienen la subcategoría "oferta"
    var vinilosOferta = $.grep(vinilos, function (vinilo) {
        return vinilo.subcategoria && vinilo.subcategoria.includes("oferta");
    });

    $.each(vinilosOferta, function (index, vinilo) {
        var $cardCarousel = $("<div>").addClass("cardCarousel").css({
            textAlign: 'center'
        });
        var $img = $("<img>").attr({
            src: vinilo.imagen,
            alt: vinilo.artista
        }).addClass("card-img-top").css({
            width: '25rem',
            borderRadius: '10px'
        });

        var $cardCarouselBody = $("<div>").addClass("cardCarousel-body").css({
            textAlign: 'center',
            marginTop: '1rem',
            marginBottom: '0rem',
            width: '25rem'
        });

        var $title = $("<h5>").addClass("cardCarousel-title").text(vinilo.artista);

        var $subtitle = $("<p>").addClass("cardCarousel-text").text(vinilo.album);

        // Aplicar descuento y formatear el precio
        var precioConDescuento = aplicarDescuento(vinilo.precio, 20).toFixed(2);
        var precioOriginal = vinilo.precio.toFixed(2);

        var $contenedorPreciosDescuento = $("<p>").addClass("precio-con-descuento").html(`<span style="color: red;">${precioConDescuento}€</span> <del>${precioOriginal}€</del>`);

        var $btnAñadirCarrito = $("<button>").addClass("añadir-carrito").text("Añadir").css({
            padding: '1rem',
            width: '15rem',
            fontSize: '1.5rem',
            backgroundColor: '#c9613b',
            borderRadius: '10px',
            transition: 'background-color 0.3s ease'
        })
            .on("click", function () {
                // Obtener el índice correcto dentro de la lista filtrada
                var indexEnListaFiltrada = vinilos.indexOf(vinilo);
                añadirOferta(indexEnListaFiltrada, $("#carrito"));
            })
            .on('mouseenter', function () {
                $(this).css('background-color', '#a84728');
            })
            .on('mouseleave', function () {
                $(this).css('background-color', '#c9613b');
            });

        $cardCarouselBody.append($title, $subtitle, $contenedorPreciosDescuento, $btnAñadirCarrito);
        $cardCarousel.append($img, $cardCarouselBody);

        // Agregar la tarjeta al carrusel
        $slickCarouselContainer.append($cardCarousel);
    });

    $slickCarouselContainer.css({
        margin: '5rem',
        width: '100rem',
    });

    $slickCarouselContainer.slick({
        centerMode: true,
        slidesToShow: 3,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 2000,
        prevArrow: '<button type="button" class="slick-prev">&#8249;</button>',
        nextArrow: '<button type="button" class="slick-next">&#8250;</button>'
    });
}

function mostrarNovedades(jsonData) {
    const vinilos = jsonData.vinilos;

    const $cardsContainer = $("#novedades-container");

    if (!vinilos || vinilos.length === 0 || !$cardsContainer.length) {
        console.error("Datos de vinilos no válidos o contenedor de tarjetas no encontrado.");
        return;
    }

    $cardsContainer.empty();

    // Filtrar vinilos que NO tienen la subcategoría "oferta"
    var vinilosFiltrados = vinilos.filter(vinilo => (vinilo.subcategoria && vinilo.subcategoria.toLowerCase().includes("novedades")));

    // Mostrar solo las primeras 5 cartas después del shuffle
    const cartasMostradas = vinilosFiltrados.slice(3, 6);

    // Construir y agregar las cartas al contenedor
    $.each(cartasMostradas, function (index, vinilo) {
        var $card = $("<div>").addClass("card").css({
            width: '25rem',
            textAlign: 'center',
            borderRadius: '10px'
        });

        var $img = $("<img>").attr({
            src: vinilo.imagen,
            alt: vinilo.artista
        }).addClass("card-img-top").css({
            width: '25rem',
            borderRadius: '10px'
        });

        var $cardBody = $("<div>").addClass("card-body").css({
            textAlign: 'center',
            marginTop: '1rem',
            marginBottom: '0rem',
            width: '25rem'
        });

        var $title = $("<h5>").addClass("card-title").text(vinilo.artista);

        var $subtitle = $("<p>").addClass("card-text").text(vinilo.album);

        var $precio = $("<p>").addClass("card-precio").text(`${vinilo.precio}€`);

        var $btnAñadirCarrito = $("<button>").addClass("añadir-carrito").text("Añadir").css({
            padding: '1rem',
            width: '15rem',
            fontSize: '1.5rem',
            backgroundColor: '#c9613b',
            borderRadius: '10px',
            transition: 'background-color 0.3s ease',
        })

            .on("click", function () {
                añadir(index, $("#carrito"));
            })

            .on('mouseenter', function () {
                $(this).css('background-color', '#a84728');
            })
            .on('mouseleave', function () {
                $(this).css('background-color', '#c9613b');
            });

        $cardBody.append($title, $subtitle, $precio, $btnAñadirCarrito);
        $card.append($img, $cardBody);
        $cardsContainer.append($card);
    });

    $cardsContainer.css('padding', '5rem');
}


function buscar() {
    var vinilos = datos;
    var tarjetasContainer = $("#tarjetas");
    var terminoBusqueda = $("#searchInput").val();

    // Limpia los resultados anteriores
    tarjetasContainer.empty();

    // Variable para realizar un seguimiento de si se encontró el vinilo
    var viniloEncontrado = false;

    // Crear un elemento para mostrar el mensaje de resultados de búsqueda
    var $resultados = $("<h1>").addClass("col-12 resultados text-center mb-4");
    $resultados.text("Resultados de búsqueda");

    // Agregar el mensaje y el botón al contenedor de tarjetas
    tarjetasContainer.append($resultados);

    // Recorre los datos (vinilos) y compara con el término de búsqueda
    $.each(vinilos, (index, elem) => {
        // Realizar la lógica de búsqueda
        if (elem.artista.toLowerCase().includes(terminoBusqueda.toLowerCase()) || elem.album.toLowerCase().includes(terminoBusqueda.toLowerCase())) {
            // Crea una nueva tarjeta basada en los datos del vinilo
            var $card = $("<div>").addClass("col-10 col-md-7 col-lg-3 vinilo-card");

            // Agregar descuento si la subcategoría es "oferta"
            var precioConDescuento = elem.subcategoria && elem.subcategoria.includes("oferta") ? aplicarDescuento(elem.precio, 20) : elem.precio;
            precioConDescuento = typeof precioConDescuento === 'number' ? precioConDescuento.toFixed(2) : precioConDescuento;

            // Tachar el precio original si es "oferta"
            var precioOriginal = elem.subcategoria && elem.subcategoria.includes("oferta") ? `<del>${elem.precio.toFixed(2)}€</del>` : elem.precio.toFixed(2) + '€';

            $card.html(`
                    <div class="row">
                        <img class="card-img-top col-12" src="${elem.imagen}" alt="Card image cap">
                        <div class="card-body text-center">
                            <h5 class="card-text">${elem.artista}</h5>
                            <p class="card-text">${elem.album}</p>
                            <p class="card-text"><span style="color: red;">${precioConDescuento}€</span> ${precioOriginal}</p>
                            <button type="button" class="añadir-carrito btn btn-outline-dark"
                                style="padding: 1rem; width: 15rem; font-size: 1.5rem;">Añadir</button>
                        </div>
                    </div>
                `);

            // Seleccionar el botón por su clase
            var botonCarrito = $card.find(".añadir-carrito");

            // Aplicar estilos usando el método css()
            botonCarrito.css({
                padding: '1rem',
                width: '15rem',
                fontSize: '1.5rem',
                backgroundColor: '#c9613b',
                borderRadius: 10,
                transition: 'background-color 0.3s ease'
            })

                .on("click", function () {
                    añadir(index, menuCarrito);
                });

            // Agrega la nueva tarjeta al contenedor
            tarjetasContainer.append($card);

            // Marca que se encontró al menos un vinilo
            viniloEncontrado = true;
        }
    });

    // Si no se encontraron vinilos, muestra un mensaje
    if (!viniloEncontrado) {
        tarjetasContainer.html("<p>No se encontraron resultados.</p>");
    }

    // Oculta secciones adicionales
    $(".recomendados").hide();
}

function aplicarDescuento(precio, porcentajeDescuento) {
    if (typeof precio !== 'number' || typeof porcentajeDescuento !== 'number') {
        console.error('Error: Los parámetros deben ser números.');
        return precio;
    }

    const descuento = (precio * porcentajeDescuento) / 100;
    const precioConDescuento = precio - descuento;

    return precioConDescuento;
}

// Crear botones fuera del bucle forEach con jQuery
var botonComprar = $("<button>").addClass("botonComprar").text("IR AL CARRITO >").css("width", "100%");
var botonEliminar = $("<button>").addClass("botonEliminar").text("Borrar Lista");

// Añadir modal en el botón Comprar
botonComprar.on('click', function () {
    showComprarModal();
});

botonEliminar.on('click', function () {
    removeList();
});

function añadir(viniloIndex, menuCarrito) {
    var vinilo = datos[viniloIndex];
    var viniloImg = vinilo.imagen;
    var viniloAlbum = vinilo.album;
    var viniloPrecio = vinilo.precio;

    var contenedorInfoCarrito = $("<div>").addClass("contenedorInfoCarrito row");
    var imgVinilo = $("<img>").addClass("viniloMiniatura col-4").attr("src", viniloImg).css({
        width: "7rem",
        height: "6rem",
        marginLeft: "0.2rem",
    });

    // Verificar si el vinilo ya ha sido seleccionado
    var listaItems = menuCarrito.find(".item");
    var cantidad = $("<h5>");

    // Verificar si el vinilo ya ha sido seleccionado
    var viniloYaSeleccionado = false;

    // Iterar sobre la lista para encontrar el vinilo
    listaItems.each(function () {
        if ($(this).data("album") === viniloAlbum) {
            viniloYaSeleccionado = true;

            // Obtener la cantidad actual y actualizarla
            var cant = parseInt($(this).data("cantidad"));
            cant++;

            // Actualizar el formato de la cantidad
            $(this).data("cantidad", cant);

            // Seleccionar el elemento de cantidad correcto y actualizar su contenido
            $(this).next().text(`${cant}x${viniloPrecio.toFixed(2)}€`);
        }
    });

    if (!viniloYaSeleccionado) {
        // Si no ha sido seleccionado, inicializar la cantidad a 1
        // y agregar una clase de datos con el nombre del álbum y la cantidad
        var listItem = $("<li>").addClass("item align-self-center").text(`${viniloAlbum}`).css({
            fontSize: "1rem",
            marginBottom: "0.5rem",
        });

        listItem.data("album", viniloAlbum);
        listItem.data("cantidad", 1);

        // Formato inicial de la cantidad
        cantidad.text(`1x${viniloPrecio.toFixed(2)}€`).css({
            fontSize: "1rem"
        });

        // Contenedor común para el título y la cantidad
        var contenedorAlbumInfo = $("<div>").addClass("col-8 text-start").css("marginLeft", "1rem")
        var contenedorX = $("<div>").addClass("col align-self-center").css({
            marginLeft: "17rem",
        });

        var eliminarCarrito = $("<button>").addClass("btn btn-danger btn-sm text-center").text("X")
            .on("click", function () {
                quitar(listItem, menuCarrito);
            })

        contenedorX.append(eliminarCarrito);
        contenedorAlbumInfo.append(listItem);
        contenedorAlbumInfo.append(cantidad);
        contenedorAlbumInfo.append(contenedorX);
        contenedorInfoCarrito.append(imgVinilo);
        contenedorInfoCarrito.append(contenedorAlbumInfo);

        // Verificar si ya hay un elemento en el carrito
        if (menuCarrito.find(".item").length > 0) {
            // Si hay un elemento, agregar un hr antes del nuevo elemento
            menuCarrito.append("<hr>");
        }

        menuCarrito.append(contenedorInfoCarrito);
        menuCarrito.append(botonComprar);

        // Luego de añadir, verificar si el carrito está vacío
        carritoVacio();
    }
}


function añadirOferta(viniloIndex, menuCarrito) {
    var vinilo = datos[viniloIndex];
    var viniloImg = vinilo.imagen;
    var viniloAlbum = vinilo.album;
    var viniloPrecio = vinilo.precio;

    var contenedorInfoCarrito = $("<div>").addClass("contenedorInfoCarrito row");
    var imgVinilo = $("<img>").addClass("viniloMiniatura col-4").attr("src", viniloImg).css({
        width: "7rem",
        height: "6rem",
        marginLeft: "0.2rem",
    });

    // Verificar si el vinilo ya ha sido seleccionado
    var listaItems = menuCarrito.find(".item");
    var cantidad = $("<h5>").css("fontSize", "1rem");

    // Verificar si el vinilo ya ha sido seleccionado
    var viniloYaSeleccionado = false;

    // Iterar sobre la lista para encontrar el vinilo
    listaItems.each(function () {
        if ($(this).data("album") === viniloAlbum) {
            viniloYaSeleccionado = true;

            // Obtener la cantidad actual y actualizarla
            var cant = parseInt($(this).data("cantidad"));
            cant++;

            // Actualizar el formato de la cantidad
            $(this).data("cantidad", cant);

            // Seleccionar el elemento de cantidad correcto y actualizar su contenido
            $(this).next().html(`${cant}x <span class="precio-con-descuento">${aplicarDescuento(viniloPrecio, 20).toFixed(2)}€</span> <del class="precio-original-tachado">${viniloPrecio.toFixed(2)}€</del>`);

            // Agregar clases CSS
            $(this).next().find('.precio-con-descuento').addClass('precio-con-descuento');
            $(this).next().find('.precio-original-tachado').addClass('precio-original-tachado');
        }
    });

    if (!viniloYaSeleccionado) {
        // Si no ha sido seleccionado, inicializar la cantidad a 1
        // y agregar una clase de datos con el nombre del álbum y la cantidad
        var listItem = $("<li>").addClass("item align-self-center").text(`${viniloAlbum}`).css({
            fontSize: "1rem",
            marginBottom: "0.5rem",
        });

        listItem.data("album", viniloAlbum);
        listItem.data("cantidad", 1);

        // Formato inicial de la cantidad
        cantidad.html(`1x <span class="precio-con-descuento">${aplicarDescuento(viniloPrecio, 20).toFixed(2)}€</span> <del class="precio-original-tachado">${viniloPrecio.toFixed(2)}€</del>`);

        // Contenedor común para el título y la cantidad
        var contenedorAlbumInfo = $("<div>").addClass("col-8 text-start").css("marginLeft", "1rem")
        var contenedorX = $("<div>").addClass("col align-self-center").css({
            marginLeft: "17rem",
        });

        var eliminarCarrito = $("<button>").addClass("btn btn-danger btn-sm text-center").text("X")
            .on("click", function () {
                quitar(listItem, menuCarrito);
            })

        contenedorX.append(eliminarCarrito);
        contenedorAlbumInfo.append(listItem);
        contenedorAlbumInfo.append(cantidad);
        contenedorAlbumInfo.append(contenedorX);
        contenedorInfoCarrito.append(imgVinilo);
        contenedorInfoCarrito.append(contenedorAlbumInfo);

        // Verificar si ya hay un elemento en el carrito
        if (menuCarrito.find(".item").length > 0) {
            // Si hay un elemento, agregar un hr antes del nuevo elemento
            menuCarrito.append("<hr>");
        }

        menuCarrito.append(contenedorInfoCarrito);
        menuCarrito.append(botonComprar);

        // Luego de añadir, verificar si el carrito está vacío
        carritoVacio();
    }
}


function quitar(listItem, menuCarrito) {
    // Obtener el contenedor completo que contiene la miniatura, el nombre del álbum y la cantidad
    var contenedorInfoCarrito = listItem.closest(".contenedorInfoCarrito");

    // Obtener el elemento <hr> que precede al contenedor
    var hrElement = contenedorInfoCarrito.next("hr");

    // Verificar si hay un elemento <hr> y eliminarlo si es necesario
    if (hrElement.length > 0) {
        hrElement.remove();
    }

    // Eliminar el contenedor del carrito
    contenedorInfoCarrito.remove();

    // Después de quitar, verificar si el carrito está vacío
    carritoVacio();
}



// Función para verificar si el carrito está vacío
function carritoVacio() {
    var menuCarrito = $("#carrito");
    var contenedorCarritoVoid = $("<div>").addClass("contenedorCarritoVoid row");

    // Verificar si NO hay elementos en el carrito
    if (menuCarrito.find(".item").length === 0) {
        // Eliminar cualquier mensaje de carrito vacío existente
        menuCarrito.find(".contenedorCarritoVoid").remove();
        // Eliminar el botón "Comprar" si existe
        menuCarrito.find(".botonComprar").remove();
        var carritoVoid = $("<img>").addClass("carritoVoid col-6").attr("src", "img/carritoVoid.png").css({
            width: "7rem",
            height: "6rem",
            marginLeft: "0.2rem",
        });
        var mensaje = $("<p>").addClass("mensaje col-6 align-self-center").text("Carrito Vacío");

        // Agregar el mensaje de carrito vacío
        contenedorCarritoVoid.append(carritoVoid);
        contenedorCarritoVoid.append(mensaje);
        menuCarrito.append(contenedorCarritoVoid);

        return true; // El carrito está vacío
    } else {
        // Si hay elementos en el carrito, eliminar el mensaje de carrito vacío si existe
        menuCarrito.find(".contenedorCarritoVoid").remove();
        return false; // El carrito no está vacío
    }
}



document.addEventListener('DOMContentLoaded', function () {
    // Establecer la fecha final de la cuenta regresiva (puedes ajustarla según tus necesidades)
    var fechaFinal = new Date('2023-12-31T23:59:59');

    function actualizarCuentaRegresiva() {
        var ahora = new Date();
        var diferencia = fechaFinal - ahora;

        if (!diferencia <= 0) {
            // Calcular días, horas, minutos y segundos restantes
            var dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
            var horas = Math.floor((diferencia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            var minutos = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60));
            var segundos = Math.floor((diferencia % (1000 * 60)) / 1000);

            // Mostrar la cuenta regresiva en el elemento HTML
            document.getElementById('cuenta').innerHTML =
                `🔥APROVECHA NUESTRAS OFERTAS🔥CONSIGUE UN 3x2⭐⭐⭐
                ${dias}d ${horas}h ${minutos}m ${segundos}s`;
        }
    }

    // Llamar a la función de actualización cada segundo
    var intervalo = setInterval(actualizarCuentaRegresiva, 1000);

    // Actualizar la cuenta regresiva inmediatamente al cargar la página
    actualizarCuentaRegresiva();
});

