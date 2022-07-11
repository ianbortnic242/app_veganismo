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

    var values = [];
    for([key, val] of Object.entries(dic)) {
        values.push(val);
      }

    console.log(values);
    let total_calorias = values.reduce((acc, ing) => acc + ing['calorias'] * ing['cantidad'], 0);
    let total_proteinas = values.reduce((acc, ing) => acc + ing['proteinas'] * ing['cantidad'], 0);
    let total_carbohidratos = values.reduce((acc, ing) => acc + ing['carbohidratos'] * ing['cantidad'], 0);
    let total_grasa = values.reduce((acc, ing) => acc + ing['grasas'] * ing['cantidad'], 0);
    let total_cantidad = values.reduce((acc, ing) => acc + ing['cantidad'], 0);

    let calorias_per_100_gr = Math.round(total_calorias / total_cantidad,1);
    let proteinas_per_100_gr = Math.round(total_proteinas / total_cantidad,1);
    let carbohidratos_per_100_gr = Math.round(total_carbohidratos / total_cantidad,1);
    let grasa_per_100_gr = Math.round(total_grasa / total_cantidad,1);

    let final_string = `calorias: (${calorias_per_100_gr}), proteinas: (${proteinas_per_100_gr} gr.), carbohidratos: (${carbohidratos_per_100_gr} gr.), grasas: (${grasa_per_100_gr} gr.).`

    return final_string;


}





class Receta{
    constructor(imagen, nombre_receta, tipo_receta, ingredientes, informacion_nutricional, preparacion){
        this.imagen = imagen;
        this.nombre_receta = nombre_receta;
        this.tipo_receta = tipo_receta
        this.ingredientes = ingredientes
        this.informacion_nutricional = informacion_nutricional
        this.preparacion = preparacion
    }
}


function guardarReceta(receta){
    json_receta = JSON.stringify({
        "imagen": receta.imagen,
        // "imagen": "../img_recetas/tiramisu.jpeg",
        "tipo_receta": receta.tipo_receta,
        "nombre_receta": receta.nombre_receta,
        "ingredientes": receta.ingredientes,
        "informacion_nutricional": receta.informacion_nutricional,
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
                    new_ingredientes[nombre_ingrediente] = {'info': info,'proteinas':info.protein_g, 'carbohidratos':info.carbohydrates_total_g,'grasas': info.fat_total_g,'calorias': info.calories,  'cantidad': cantidad_ingrediente};
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
    let ingredientes = get_cantidad_ingredientes(new_ingredientes);
    let informacion_nutricional = get_informacion_nutricional_receta(new_ingredientes);
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