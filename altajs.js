const URL = "https://braccoi.pythonanywhere.com/"

        //Al subir al servidor, deberá utilizarse la siguiente ruta. USUARIO debe ser reemplazado por el nombre de usuario de Pythonanywhere
        //const URL = "https://USUARIO.pythonanywhere.com/"
        

        // Capturamos el evento de envío del formulario
        document.getElementById('formulario').addEventListener('submit', function (event) {
            event.preventDefault(); // Evitamos que se envie el form 

            var formData = new FormData(this);
    
            // Realizamos la solicitud POST al servidor
            fetch(URL + 'amigus', {
                method: 'POST',
                body: formData // Aquí enviamos formData. Dado que formData puede contener archivos, no se utiliza JSON.
            })

            //Después de realizar la solicitud POST, se utiliza el método then() para manejar la respuesta del servidor.
            .then(function (response) {
                    if (response.ok) { 
                        //Si la respuesta es exitosa, convierte los datos de la respuesta a formato JSON.
                        return response.json(); 
                    } else {
                        // Si hubo un error, lanzar explícitamente una excepción
                        // para ser "catcheada" más adelante
                        throw new Error('Error al agregar el Amigu.');
                    }
            })

                //Respuesta OK, muestra una alerta informando que el producto se agregó correctamente y limpia los campos del formulario para que puedan ser utilizados para un nuevo producto.
                .then(function (data) {
                    alert('Amigu agregado correctamente.');
                })

                // En caso de error, mostramos una alerta con un mensaje de error.
                .catch(function (error) {
                    alert('Error al agregar el Amigu.');
                })

                // Limpiar el formulario en ambos casos (éxito o error)
                .finally(function () {
                    document.getElementById('descripcion').value = "";
                    document.getElementById('nombre_autor').value = "";
                    document.getElementById('imagenProducto').value = "";
                });
        })