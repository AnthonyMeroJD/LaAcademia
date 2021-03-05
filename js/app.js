const contenedorCurso = document.querySelector("#lista-cursos");
const carritoContenedor = document.querySelector("#lista-carrito tbody");
const btnVaciarCarrito = document.querySelector("#vaciar-carrito");
const selectCategoria = document.querySelector("#categoria");
const busqueda = document.querySelector('#busqueda');
const cursoBusqueda = {
    titulo: '',
    precio: '',
    categoria: '',
    id: ''
}
let carrito = [];

initApp();

function initApp() {

    createCurseFromJSONtoHTML(cursos);
    fillCategoriaOptions();
    btnVaciarCarrito.addEventListener("click", (e) => {
        e.preventDefault();
        carrito = [];
        clearContentCarrito();
    });
    contenedorCurso.addEventListener("click", addCarrito);
    carritoContenedor.addEventListener("click", deleteCurso);
    selectCategoria.addEventListener("input", e => {
        cursoBusqueda.categoria = e.target.value;
        filtrarCurso();
    });
    busqueda.addEventListener("input", e => {
        console.log(e.target.value);
        cursoBusqueda.titulo = e.target.value;
        filtrarCurso();
    })
    localStorage.length > 0 ? fillCartWithLocalStorage() : null;
}

function fillCartWithLocalStorage() {
    const r = JSON.parse(localStorage.getItem('carrito'));
    r.forEach(curso => carrito = [...carrito, curso]);
    createElemtsForCarrito();
}

function filtrarCurso() {
    const cursoFilter = cursos.filter(filterForCategoria).filter(filterForName);
    console.log(cursoFilter);
    formatContenCursoEmpy();
    createCurseFromJSONtoHTML(cursoFilter);

}

function filterForName(curso) {
    const { titulo } = cursoBusqueda;
    if (titulo) {
        console.log(curso.titulo.includes(titulo));
        return curso.titulo.toLowerCase().includes(titulo.toLowerCase());
    }
    return curso;
}

function filterForCategoria(curso) {
    const { categoria } = cursoBusqueda;
    if (categoria) {
        return curso.categoria === categoria;
    }
    return curso;
}

function formatContenCursoEmpy() {
    const cursosRaws = contenedorCurso.querySelectorAll('div');
    const noFound = contenedorCurso.querySelectorAll('h1.no-found');
    noFound.forEach(element => element.remove());
    cursosRaws.forEach(element => element.remove());
}

function fillCategoriaOptions() {
    const categorias = getCategoriasFromCurse();
    categorias.forEach(categoria => {
        const opcion = createOptionElement(categoria);
        selectCategoria.appendChild(opcion);
    });

}

function createOptionElement(value) {
    const op = document.createElement('option');
    op.setAttribute("value", `${value}`);
    op.textContent = value;
    return op;
}

function getCategoriasFromCurse() {
    let categorias = cursos.map(curso => curso.categoria);
    let catAux = [];
    catAux = categorias.filter(categoria => catAux.includes(categoria) ? null : catAux = [...catAux, categoria]);
    return catAux;
}

function deleteCurso(e) {
    e.preventDefault();
    const target = e.target;
    if (target.classList.contains("borrar-curso")) {
        const idCurso = target.getAttribute("data-id");
        carrito = carrito.filter((e) => e.id !== idCurso);
        clearContentCarrito();
        sincToLocalStorage();
        createElemtsForCarrito();
    }
}

function addCarrito(e) {
    e.preventDefault();
    const target = e.target;
    target.classList.contains("agregar-carrito") ?
        agregarProductoToCarrito(target.parentElement.parentElement) :
        null;
}

function agregarProductoToCarrito(cursoElement) {
    const curso = createObjectCurso(cursoElement);
    clearContentCarrito();
    isThisCurseInTheCarrito(curso) ?
        addCantidadToThisCurse(curso) :
        (carrito = [...carrito, curso]);
    createElemtsForCarrito();
    sincToLocalStorage();
}

function sincToLocalStorage() {
    const carritoString = JSON.stringify(carrito)
    localStorage.setItem("carrito", carritoString);
}

function addCantidadToThisCurse(curso) {
    const { id } = curso;
    carrito = carrito.map((curso) => {
        if (curso.id === id) {
            curso.cantidad++;
            curso.precio *= curso.cantidad;
        }
        return curso;
    });
}

function isThisCurseInTheCarrito(curso) {
    const { id } = curso;
    return carrito.some((curso) => curso.id === id);
}

function clearContentCarrito() {
    while (carritoContenedor.firstChild) {
        carritoContenedor.removeChild(carritoContenedor.firstChild);
    }
}

function createElemtsForCarrito() {
    carrito.forEach((curso) => {
        const { nombre, img, precio, id, cantidad } = curso;
        const tr = document.createElement("tr");
        tr.innerHTML = `<td><img src="${img}" width="100"/></td>
                            <td><p>${nombre}</p></td>
                            <td><p>${precio}</p></td>
                            <td><p>${cantidad}</p></td>
                            <td><a data-id=${id} class="borrar-curso">X</a></td>
            `;
        appendChildToParent(carritoContenedor, tr);
    });
}

function createObjectCurso(cursoElement) {
    return {
        cantidad: 1,
        img: cursoElement.querySelector("img").src,
        nombre: cursoElement.querySelector("h4").textContent,
        precio: cursoElement
            .querySelector("p.precio span.u-pull-right")
            .textContent.replace("$", ""),
        id: cursoElement.querySelector("a.agregar-carrito").getAttribute("data-id"),
    };
}


function createCurseFromJSONtoHTML(cursosJson) {
    let isParentDivCreated = false;
    let divParent;
    cursosJson.length > 0 ?
        cursosJson.forEach((curso, index) => {
            const card = createCardHtmlFromCurso(curso);
            const isFirstCurseOfRaw = index % 3 === 0 && !isParentDivCreated;
            const isAnoterCurseOfRaw = index % 3 != 0 && isParentDivCreated;
            if (isFirstCurseOfRaw) {
                const isTheLastCurseOfRaw = index === cursosJson.length - 1;
                divParent = createDivParentForCard();
                appendChildToParent(divParent, card);
                isParentDivCreated = true;
                if (isTheLastCurseOfRaw) {
                    appendChildToParent(contenedorCurso, divParent);
                    isParentDivCreated = false;
                }
            } else if (isAnoterCurseOfRaw) {
                const isTheLastCurseOfRaw = index % 3 == 2 || index === cursosJson.length - 1;
                appendChildToParent(divParent, card);
                if (isTheLastCurseOfRaw) {
                    appendChildToParent(contenedorCurso, divParent);
                    isParentDivCreated = false;
                }
            }
        }) : noResultsFound();
}

function noResultsFound() {
    formatContenCursoEmpy();
    const h1 = document.createElement('h1');
    h1.classList.add('no-found')
    h1.textContent = 'NO SE ENCONTRARON RESULTADOS';
    appendChildToParent(contenedorCurso, h1);
}

function appendChildToParent(parent, child) {
    return parent.appendChild(child);
}

function createDivParentForCard() {
    const contentCard = document.createElement("div");
    contentCard.classList.add("row");
    return contentCard;
}

function createCardHtmlFromCurso(curso) {
    const { titulo, precio, categoria, id } = curso;
    const div = document.createElement("div");
    div.classList.add("four", "columns");
    div.innerHTML = `<div class='card'><img src="img/curso1.jpg" class="imagen-curso u-full-width">
    <div class="info-card">
        <h4>${titulo}</h4>
        <p>${categoria}</p>
        <img src="img/estrellas.png">
        <p class="precio">$${precio} <span class="u-pull-right ">$${
    precio - precio * 0.2
  }</span></p>
        <a href="#" class="u-full-width button-primary button input agregar-carrito" data-id="${id}">Agregar Al Carrito</a>
    </div>`;
    return div;
}