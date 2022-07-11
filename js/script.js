const btnRecetasTodas = document.querySelector('#recetas_todas');
const btnRecetasDulces = document.querySelector('#recetas_dulces');
const btnRecetasSaladas = document.querySelector('#recetas_saladas');

const btnPropiasRecetas = document.querySelector('#propias_recetas');

const contenedor = document.querySelector('#contenedorTarjetas');
const container = document.querySelector('#cardContainer');
const selectTipoReceta = document.querySelector('#tipo_receta');
const searchBtn = document.querySelector('#search');

// let ian = {'ian':{'cantidad': 200}, 'max':{'cantidad': 100}};

function get_cantidad_ingredientes(dic){
    let final_string = '';
    for([key, val] of Object.entries(dic)) {
        final_string += `${key} (${val.cantidad} gr), `;
      }
    return final_string;
}

function get_informacion_nutricional_receta(dic){
    let total_calorias = dic.reduce((acc, ing) => acc + ing.calorias * ing.cantidad, 0);
    let total_proteinas = dic.reduce((acc, ing) => acc + ing.proteinas * ing.cantidad, 0);
    let total_carbohidratos = dic.reduce((acc, ing) => acc + ing.carbohidratos * ing.cantidad, 0);
    let total_grasa = dic.reduce((acc, ing) => acc + ing.grasa * ing.cantidad, 0);
    let total_cantidad = dic.reduce((acc, ing) => acc + ing.cantidad, 0);

    let calorias_per_100_gr = 100 * total_calorias / total_cantidad;
    let proteinas_per_100_gr = 100 * total_proteinas / total_cantidad;
    let carbohidratos_per_100_gr = 100 * total_carbohidratos / total_cantidad;
    let grasa_per_100_gr = 100 * total_grasa / total_cantidad;

    let final_string = `calorias: (${calorias_per_100_gr}), proteinas: (${proteinas_per_100_gr} gr.), carbohidratos: (${carbohidratos_per_100_gr} gr.), grasa: (${grasa_per_100_gr} gr.).`

    return final_string;


}





class Receta{
    constructor(imagen, nombre_receta, tipo_receta, ingredientes, informacion_nutricional, preparacion){
        this.imagen = imagen;
        this.nombre_receta = nombre_receta;
        this.tipo_receta = tipo_receta
        this.ingredientes = ingredientes
        this.informacion_nutricional = 'in process'
        this.preparacion = preparacion
    }
}


function guardarReceta(receta){
    json_receta = JSON.stringify({
        "imagen": receta.imagen,
        // "imagen": "../img_recetas/tiramisu.jpeg",
        "tipo_receta": receta.tipo_receta,
        "nombre_receta": receta.nombre_receta,
        "ingredientes": get_cantidad_ingredientes(receta.ingredientes),
        // "informacion_nutricional": get_informacion_nutricional_receta(receta.informacion_nutricional),
        "informacion_nutricional": 'in process',
        "preparacion": receta.preparacion,

    })

    localStorage.setItem(receta.nombre_receta, json_receta);
}


let maximo_calorias = 400;

let btnIngresarNombre = document.getElementById('Ingresar Nombre');

btnIngresarNombre.addEventListener('click', ()=>{
    let nombre_receta = document.getElementById('nombre_receta').value;
    Swal.fire({
        icon: 'success',
        title: `${nombre_receta}, excelente nombre!`,
        text: 'ya me dio hambre...',
    })
})


let btnIngresarIngrediente = document.getElementById('Ingresar Ingrediente');

let new_ingredientes =  {};

btnIngresarIngrediente.addEventListener('click', ()=>{
    let nombre_ingrediente = document.getElementById('nombre_ingrediente').value;
    let cantidad_ingrediente = parseInt(document.getElementById('cantidad_ingrediente').value);
    if(isNaN(cantidad_ingrediente)  || cantidad_ingrediente<=0){
        Swal.fire({
            icon: 'error',
            text: 'Debes ingresar una cantidad valida',
        })
    }
    else{
        const options = {
            method: 'GET',
            headers: {
                'X-RapidAPI-Key': 'e36396658amsh6b953c4687eb158p19aceajsn2948e2608aed',
                'X-RapidAPI-Host': 'calorieninjas.p.rapidapi.com'
            }
        };

        fetch(`https://calorieninjas.p.rapidapi.com/v1/nutrition?query=${nombre_ingrediente}`, options)
            .then(response => response.json())
            .then(response => {
                if(response.items.length>0){
                    // console.log(response.items[0].name);
                    let info = response.items[0];
                    new_ingredientes[nombre_ingrediente] = {'info': info,'proteina':info.protein_g, 'carbohidratos':info.carbohydrates_total_g,'grasa': info.fat_total_g,'calorias': info.calories,  'cantidad': cantidad_ingrediente};
                    console.log(new_ingredientes);

                }else{
                    Swal.fire({
                        icon: 'error',
                        text: 'Lo sentimos, no pudimos encontrar ese ingrediente.',
                    })

                }

            })
            .then(document.getElementById('nombre_ingrediente').value='')
            .then(document.getElementById('cantidad_ingrediente').value='')
        }
    })


let btnIngresarReceta = document.getElementById('Ingresar Receta');


btnIngresarReceta.addEventListener('click', ()=>{
    console.log(new_ingredientes);
    let imagen = document.getElementById('imagen_receta').value;
    let tipo_receta = document.getElementById('tipo_receta').value;
    let nombre_receta = document.getElementById('nombre_receta').value;
    let ingredientes = new_ingredientes;
    let informacion_nutricional = "1 caloria";
    let preparacion = document.getElementById('preparacion').value;


    let receta = new Receta(imagen, nombre_receta, tipo_receta, ingredientes, informacion_nutricional, preparacion);
    // total_calorias = new_ingredientes.reduce((acc, ing) => acc + ing.calories, 0);
    total_calorias = 100;
    if(total_calorias==0){
        Swal.fire({
            icon: 'error',
            text: 'No puede ingresar una receta vacía.  ',
        })
    }
    else{
        if(total_calorias > maximo_calorias){
            Swal.fire({
                icon: 'error',
                title: `${nombre_receta} no pudo ser ingresada.`,
                text: `Excede el máximo de calorías (${maximo_calorias})! (tiene un total de ${total_calorias} calorías)`,
            })}
            else{
                Swal.fire({
                    icon: 'success',
                    title: `${nombre_receta} ha sido ingresada con éxito!`,
                })
                guardarReceta(receta);
            }
    }

})


// let btnVerRecetas = document.getElementById('Ver Recetas');

// btnVerRecetas.addEventListener('click', ()=>{
//     let lista_recetas = document.getElementById('lista recetas');
//     lista_recetas.innerHTML = '';
//     for(let i=0; i<localStorage.length; i++){
//         let nombre_receta = localStorage.key(i);
//         let li = document.createElement('li');
//         li.innerHTML +=`<p>${nombre_receta}</p>`;
//         lista_recetas.appendChild(li);

//     }
// })

// let btnOcultarRecetas = document.getElementById('Ocultar Recetas');

// btnOcultarRecetas.addEventListener('click', ()=>{
//     let lista_recetas = document.getElementById('lista recetas');
//     lista_recetas.innerHTML = '';
// })




// let btnEliminarReceta = document.getElementById('Eliminar Receta');

// btnEliminarReceta.addEventListener('click', ()=>{
//     let receta_eliminada = document.getElementById('nombre_receta_a_eliminar').value;
//     if (localStorage.getItem(receta_eliminada) === null) {
//         Swal.fire({
//             icon: 'error',
//             title: `Usted no tiene registrada la receta: ${receta_eliminada}`,
//         })
//     }
//     else{
//         Swal.fire({
//             icon: 'success',
//             title: `${receta_eliminada} ha sido eliminada de sus recetas.`,
//         })
//         localStorage.removeItem(receta_eliminada);
//         let lista_recetas = document.getElementById('lista recetas');
//         lista_recetas.innerHTML = '';
//         for(let i=0; i<localStorage.length; i++){
//             let nombre_receta = localStorage.key(i);
//             let li = document.createElement('li');
//             li.innerHTML +=`<p>${nombre_receta}</p>`;
//             lista_recetas.appendChild(li);

//         }

//     }
// })


function createHTML(array) {
    contenedor.innerHTML = '';
    container.innerHTML = '';
    array.forEach((receta) => {
        const tarjeta = `
            <div class="col" style="margin-bottom: 50px;">
                <div class="card h-100">
                    <img src="${receta.imagen}" class="card-img-top" alt="${receta.nombre_receta}">
                    <div class="card-body black_title" style="height: 300px;  overflow: scroll">
                        <p class="card-text" style="color: black"><b> Nombre:</b> ${receta.nombre_receta}</p>
                        <p class="card-text" style="color: black"><b>Información Nutricional (c/ 100 gr.):</b> ${receta.informacion_nutricional}</p>
                        <p class="card-text" style="color: black"><b>Ingredientes:</b> ${receta.ingredientes}</p>
                        <p class="card-text" style="color: black"><b>Preparación:</b> ${receta.preparacion}</p>
                    </div>
                </div>
            </div>`;
        contenedor.innerHTML += tarjeta;
    })
}




function filtrarRecetas(recetas, tipo_receta){
    if(tipo_receta=='Todas'){
        return recetas
    }else{
        const recetas_filtradas = recetas.filter(receta => receta.tipo_receta == tipo_receta);
        return recetas_filtradas;
    }

}



async function traerRecetas(tipo_receta) {
    const respuesta = await fetch('../js/data.json');
    const data = await respuesta.json();
    createHTML(filtrarRecetas(data, tipo_receta));
}

btnRecetasTodas.addEventListener('click', () => {
    traerRecetas("Todas");
})
btnRecetasDulces.addEventListener('click', () => {
    traerRecetas("Dulce");
})
btnRecetasSaladas.addEventListener('click', () => {
    traerRecetas("Salada");
})


btnPropiasRecetas.addEventListener('click', () => {

    let propias_recetas = [];

    for(let i=0; i<localStorage.length; i++){
        let nombre_receta = localStorage.key(i);
        receta = localStorage.getItem(nombre_receta);
        propias_recetas.push(JSON.parse(receta));
    }
    console.log(propias_recetas);
    createHTML(propias_recetas);
})





// CLASE 15 CODERHOUSE




// const contenedor = document.querySelector('#contenedorTarjetas');
// const container = document.querySelector('#cardContainer');
// const selectCasa = document.querySelector('#casa');
// const btnBuscar = document.querySelector('#buscar');
// const searchBtn = document.querySelector('#search');

// function filtrarCasa(array) {
//     let casa = selectCasa.value;
//     if (!casa) {
//         return array;
//     } else {
//         resultado = array.filter((e) => e.casaDeHogwarts == casa);
//         return resultado;
//     }
// }

// function crearHTML(array) {
//     contenedor.innerHTML = '';
//     container.innerHTML = '';
//     array.forEach((personaje) => {
//         const tarjeta = `
//             <div class="col">
//                 <div class="card h-100">
//                     <img src="${personaje.imagen}" class="card-img-top" alt="${personaje.apodo}">
//                     <div class="card-body">
//                         <h5 class="card-title">${personaje.apodo}</h5>
//                         <p class="card-text">Nombre: ${personaje.personaje}</p>
//                         <p class="card-text">Casa: ${personaje.casaDeHogwarts}</p>
//                         <p class="card-text">Interpretado por: ${personaje.interpretado_por}</p>
//                     </div>
//                 </div>
//             </div>`;
//         contenedor.innerHTML += tarjeta;
//     })
// }

// btnBuscar.addEventListener('click',()=>{

//     fetch('https://fedeperin-harry-potter-api.herokuapp.com/personajes/')
//     .then((response)=>response.json())
//     .then((data)=>{
//         crearHTML(filtrarCasa(data));
//     })

// })

// function houseFilter(array) {
//     let house = selectCasa.value;
//     if (!house) {
//         return array;
//     } else {
//         result = array.filter((e) => e.house == house);
//         return result;
//     }
// }

// function createHTML(array) {
//     contenedor.innerHTML = ''
//     container.innerHTML = ''
//     array.forEach((personaje) => {
//         const card = `
//             <div class="col">
//                 <div class="card h-100">
//                     <img src="${personaje.image}" class="card-img-top" alt="${personaje.name}">
//                     <div class="card-body">
//                         <h5 class="card-title">${personaje.name}</h5>
//                         <p class="card-text">Especie: ${personaje.species}</p>
//                         <p class="card-text">Nacimiento: ${personaje.dateOfBirth}</p>
//                         <p class="card-text">Casa: ${personaje.house}</p>
//                         <p class="card-text">Patronus: ${personaje.patronus}</p>
//                         <p class="card-text">Interpretado por: ${personaje.actor}</p>
//                     </div>
//                 </div>
//             </div>`
//         container.innerHTML += card
//     })
// }

// async function traerDatos() {
//     const respuesta = await fetch('./js/data.json');
//     const data = await respuesta.json();
//     createHTML(houseFilter(data));
// }

// searchBtn.addEventListener('click', () => {
//     traerDatos();
// })








