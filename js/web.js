$(document).ready(() => init());

function init() {
    getData();
    $("#categoria").on("change", function () {
        filtrarPorCategoria()
    });

    $(".search-button").on("click", function () {
        buscar()
    });
}

var datos;
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

    // Hacer un shuffle aleatorio de los vinilos
    for (let i = vinilos.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [vinilos[i], vinilos[j]] = [vinilos[j], vinilos[i]];
    }

    const $cardsContainer = $("#cards-container");

    if (!vinilos || vinilos.length === 0 || !$cardsContainer.length) {
        console.error("Datos de vinilos no válidos o contenedor de tarjetas no encontrado.");
        return;
    }

    $cardsContainer.empty();

    // Mostrar solo las primeras 5 cartas después del shuffle
    const cartasMostradas = vinilos.slice(0, 5);

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
        vinilosFiltrados = vinilos.filter(function (vinilo) {
            // Verificar si la propiedad 'categoria' es un array
            const esArray = Array.isArray(vinilo.categoria);

            // Realizar el filtro
            return esArray ? vinilo.categoria.includes(filtroCategoria) : vinilo.categoria === filtroCategoria;
        });
    }

    resultadosDiv.empty();
    if (vinilosFiltrados.length === 0) {
        resultadosDiv.html("<p>No hay vinilos en esta categoría.</p>");
    } else {
        // Crear una fila (row) para el contenedor de tarjetas
        var $fila = $("<div>").addClass("row");

        vinilosFiltrados.forEach(vinilo => {
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
            
            // Agregar la tarjeta a la fila
            $fila.append($tarjeta);
        });

        // Agregar la fila al contenedor de resultados
        resultadosDiv.append($fila);
    }
}

function carousel(jsonData) {
    const vinilos = jsonData.vinilos;
    const $slickCarouselContainer = $("#slick-carousel");

    if (!vinilos || vinilos.length === 0 || !$slickCarouselContainer.length) {
        console.error("Datos de vinilos no válidos o contenedor de carrusel no encontrado.");
        return;
    }

    $slickCarouselContainer.empty();

    // Filtrar vinilos que tienen la subcategoría "oferta"
    var vinilosOferta = vinilos.filter(vinilo => vinilo.subcategoria && vinilo.subcategoria.includes("oferta"));

    vinilosOferta.forEach(function (vinilo) {
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

        var $precio = $("<p>").addClass("cardCarousel-precio").text(`${vinilo.precio}€`);

        var $btnAñadirCarrito = $("<button>").addClass("añadir-carrito").text("Añadir").css({
            padding: '1rem',
            width: '15rem',
            fontSize: '1.5rem',
            backgroundColor: '#c9613b',
            borderRadius: '10px',
            transition: 'background-color 0.3s ease'
        })
            .on('mouseenter', function () {
                $(this).css('background-color', '#a84728');
            })
            .on('mouseleave', function () {
                $(this).css('background-color', '#c9613b');
            });

        $cardCarouselBody.append($title, $subtitle, $precio, $btnAñadirCarrito);
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
        // Ajusta las opciones según tus necesidades
    });
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
            $card.html(`
                    <div class="row">
                        <img class="card-img-top col-12" src="${elem.imagen}" alt="Card image cap">
                        <div class="card-body text-center">
                            <h5 class="card-text">${elem.artista}</h5>
                            <p class="card-text">${elem.album}</p>
                            <p class="card-text">${elem.precio}€</p>
                            <button type="button" class="añadir btn btn-outline-dark"
                                style="padding: 1rem; width: 15rem; font-size: 1.5rem;">Añadir</button>
                        </div>
                    </div>
                `);
            // Seleccionar el botón por su clase
            var botonCarrito = $card.find(".añadir");

            // Aplicar estilos usando el método css()
            botonCarrito.css({
                padding: '1rem',
                width: '15rem',
                fontSize: '1.5rem',
                backgroundColor: '#c9613b',
                borderRadius: 10,
                transition: 'background-color 0.3s ease'
            });

            var viniloText = $card.find(".card-text");
            viniloText.css({
                marginTop: '2rem',
                fontSize: '2rem',
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

document.addEventListener('DOMContentLoaded', function () {
    // Establecer la fecha final de la cuenta regresiva (puedes ajustarla según tus necesidades)
    var fechaFinal = new Date('2023-12-31T23:59:59');

    function actualizarCuentaRegresiva() {
        var ahora = new Date();
        var diferencia = fechaFinal - ahora;

        if (diferencia <= 0) {
            // La cuenta regresiva ha terminado
            clearInterval(intervalo);
            document.getElementById('cuenta-regresiva').innerHTML = '¡Cuenta regresiva terminada!';
        } else {
            // Calcular días, horas, minutos y segundos restantes
            var dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
            var horas = Math.floor((diferencia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            var minutos = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60));
            var segundos = Math.floor((diferencia % (1000 * 60)) / 1000);

            // Mostrar la cuenta regresiva en el elemento HTML
            document.getElementById('cuenta-regresiva').innerHTML =
                `APROVECHA NUESTRAS OFERTAS, CONSIGUE UN 3x2 EN TODOS NUESTROS VINILOS: ${dias}d ${horas}h ${minutos}m ${segundos}s`;
        }
    }

    // Llamar a la función de actualización cada segundo
    var intervalo = setInterval(actualizarCuentaRegresiva, 1000);

    // Actualizar la cuenta regresiva inmediatamente al cargar la página
    actualizarCuentaRegresiva();
});

