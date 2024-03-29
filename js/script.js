class Receta {
    constructor(imagen, nombre_receta, tipo_receta, ingredientes, informacion_nutricional, preparacion) {
        this.nombre_receta = nombre_receta;
        this.tipo_receta = tipo_receta
        this.ingredientes = ingredientes
        this.informacion_nutricional = informacion_nutricional
        this.preparacion = preparacion
        this.imagen = imagen
    }
}


function get_cantidad_ingredientes(dic) {
    let final_string = '';
    for ([key, val] of Object.entries(dic)) {
        final_string += `${key} (${val.cantidad} gr), `;
    }
    return final_string;
}

function get_informacion_nutricional_receta(dic) {

    var values = [];
    for ([key, val] of Object.entries(dic)) {
        values.push(val);
    }

    let total_calorias = values.reduce((acc, ing) => acc + ing['calorias'] * ing['cantidad'], 0);
    let total_proteinas = values.reduce((acc, ing) => acc + ing['proteinas'] * ing['cantidad'], 0);
    let total_carbohidratos = values.reduce((acc, ing) => acc + ing['carbohidratos'] * ing['cantidad'], 0);
    let total_grasa = values.reduce((acc, ing) => acc + ing['grasas'] * ing['cantidad'], 0);
    let total_cantidad = values.reduce((acc, ing) => acc + ing['cantidad'], 0);

    let calorias_per_100_gr = Math.round(total_calorias / total_cantidad, 1);
    let proteinas_per_100_gr = Math.round(total_proteinas / total_cantidad, 1);
    let carbohidratos_per_100_gr = Math.round(total_carbohidratos / total_cantidad, 1);
    let grasa_per_100_gr = Math.round(total_grasa / total_cantidad, 1);

    let final_string = `calorias: (${calorias_per_100_gr}), proteinas: (${proteinas_per_100_gr} gr.), carbohidratos: (${carbohidratos_per_100_gr} gr.), grasas: (${grasa_per_100_gr} gr.).`

    return [final_string, calorias_per_100_gr];


}



function guardarReceta(receta) {
    json_receta = JSON.stringify({
        "imagen": receta.imagen,
        "tipo_receta": receta.tipo_receta,
        "nombre_receta": receta.nombre_receta,
        "ingredientes": receta.ingredientes,
        "informacion_nutricional": receta.informacion_nutricional,
        "preparacion": receta.preparacion,

    })

    localStorage.setItem(receta.nombre_receta, json_receta);
}


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


function filtrarRecetas(recetas, tipo_receta) {
    if (tipo_receta == 'Todas') {
        return recetas
    } else {
        const recetas_filtradas = recetas.filter(receta => receta.tipo_receta == tipo_receta);
        return recetas_filtradas;
    }

}



async function traerRecetas(tipo_receta) {
    const respuesta = await fetch('../js/data.json');
    const data = await respuesta.json();

    let propias_recetas = [];

    for (let i = 0; i < localStorage.length; i++) {
        let nombre_receta = localStorage.key(i);
        receta = localStorage.getItem(nombre_receta);
        propias_recetas.push(JSON.parse(receta));

    }

    todas_las_recetas = propias_recetas.concat(data)

    recetas_filtradas = filtrarRecetas(todas_las_recetas, tipo_receta)
    createHTML(recetas_filtradas);
}


const btnRecetasTodas = document.querySelector('#recetas_todas');
const btnRecetasDulces = document.querySelector('#recetas_dulces');
const btnRecetasSaladas = document.querySelector('#recetas_saladas');

const contenedor = document.querySelector('#contenedorTarjetas');
const container = document.querySelector('#cardContainer');


let btnIngresarNombre = document.getElementById('Ingresar Nombre');

let btnIngresarIngrediente = document.getElementById('Ingresar Ingrediente');

let btnIngresarReceta = document.getElementById('Ingresar Receta');

let new_ingredientes = {};

let maximo_calorias_per_100_g = 400;


btnIngresarNombre.addEventListener('click', () => {
    let nombre_receta = document.getElementById('nombre_receta').value;
    Swal.fire({
        icon: 'success',
        title: `${nombre_receta}, excelente nombre!`,
        text: 'ya me dio hambre...',
    })
})

btnIngresarIngrediente.addEventListener('click', () => {
    let nombre_ingrediente = document.getElementById('nombre_ingrediente').value;
    let cantidad_ingrediente = parseInt(document.getElementById('cantidad_ingrediente').value);
    if (isNaN(cantidad_ingrediente) || cantidad_ingrediente <= 0) {
        Swal.fire({
            icon: 'error',
            text: 'Debes ingresar una cantidad valida',
        })
    } else {
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
                if (response.items.length > 0) {
                    let info = response.items[0];
                    new_ingredientes[nombre_ingrediente] = {
                        'info': info,
                        'proteinas': info.protein_g,
                        'carbohidratos': info.carbohydrates_total_g,
                        'grasas': info.fat_total_g,
                        'calorias': info.calories,
                        'cantidad': cantidad_ingrediente
                    };

                } else {
                    Swal.fire({
                        icon: 'error',
                        text: 'Lo sentimos, no pudimos encontrar ese ingrediente.',
                    })

                }

            })
            .then(document.getElementById('nombre_ingrediente').value = '')
            .then(document.getElementById('cantidad_ingrediente').value = '')
    }
})





btnIngresarReceta.addEventListener('click', () => {

    let nombre_receta = document.getElementById('nombre_receta').value;

    if (nombre_receta == '') {
        Swal.fire({
            icon: 'error',
            text: 'Debe Ingresar un nombre para su receta',
        })

    } else {
        let imagen = document.getElementById('imagen_receta');
        let files = imagen.files;


        const reader = new FileReader();


        reader.addEventListener("load", () => {

            imagen_url = reader.result;


            if (imagen == '') {
                Swal.fire({
                    icon: 'error',
                    text: 'Debe subir una imagen de su receta',
                })

            } else {
                let preparacion = document.getElementById('preparacion').value;
                if (preparacion == '') {
                    Swal.fire({
                        icon: 'error',
                        text: 'Debe detallar la preparacion de su receta',
                    })

                } else {

                    let tipo_receta = document.getElementById('tipo_receta').value;

                    let ingredientes = get_cantidad_ingredientes(new_ingredientes);
                    let [informacion_nutricional, calorias_per_100_gr] = get_informacion_nutricional_receta(new_ingredientes);

                    let receta = new Receta(imagen_url, nombre_receta, tipo_receta, ingredientes, informacion_nutricional, preparacion);

                    if (calorias_per_100_gr == 0) {
                        Swal.fire({
                            icon: 'error',
                            text: 'No puede ingresar una receta vacía.  ',
                        })
                    } else {
                        if (calorias_per_100_gr > maximo_calorias_per_100_g) {
                            Swal.fire({
                                icon: 'error',
                                title: `${nombre_receta} no pudo ser ingresada.`,
                                text: `Excede el máximo de calorías c/ 100 gr. (${maximo_calorias_per_100_g})! (tiene un total de ${calorias_per_100_gr} calorías c/ 100 gr.)`,
                            })
                        } else {
                            Swal.fire({
                                icon: 'success',
                                title: `${nombre_receta} ha sido ingresada con éxito! Ya puedes verla mas arriba con las demás recetas!`,
                            })
                            guardarReceta(receta);
                        }
                    }

                }

            }

        })



        reader.readAsDataURL(files[0]);



    }



})



btnRecetasTodas.addEventListener('click', () => {
    traerRecetas("Todas");
})
btnRecetasDulces.addEventListener('click', () => {
    traerRecetas("Dulce");
})
btnRecetasSaladas.addEventListener('click', () => {
    traerRecetas("Salada");
})