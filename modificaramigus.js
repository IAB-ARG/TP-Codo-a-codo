const URL = "http://127.0.0.1:5000/"

        // Al subir al servidor, deberá utilizarse la siguiente ruta. USUARIO debe ser reemplazado por el nombre de usuario de Pythonanywhere
        //const URL = "https://USUARIO.pythonanywhere.com/"

        // Variables de estado para controlar la visibilidad y los datos del formulario
        let codigo = '';
        let descripcion = '';
        let nombre_autor = '';
        // let precio = '';
        // let proveedor = '';
        let imagen = '';
        let imagenSeleccionada = null;
        let imagenUrlTemp = null;
        let mostrarDatosProducto = false;

        document.getElementById('form-obtener-producto').addEventListener('submit', obtenerProducto);
        document.getElementById('form-guardar-cambios').addEventListener('submit', guardarCambios);
        document.getElementById('nuevaImagen').addEventListener('change', seleccionarImagen);

        // Se ejecuta cuando se envía el formulario de consulta. Realiza una solicitud GET a la API y obtiene los datos del producto correspondiente al código ingresado.
        function obtenerProducto(event) {
            event.preventDefault();
            codigo = document.getElementById('codigo').value;
            fetch(URL + 'amigus/' + codigo)
                .then(response => {
                    if (response.ok) {
                        return response.json()
                    } else {
                        throw new Error('Error al obtener los datos del Amigurumi.')
                    }
                })
                .then(data => {
                    descripcion = data.descripcion;
                    nombre_autor = data.nombre_autor;
                    // proveedor = data.proveedor;
                    imagen = data.imagen;
                    mostrarDatosProducto = true; //Activa la vista del segundo formulario
                    mostrarFormulario();
                })
                .catch(error => {
                    alert('Amigurumi no encontrado.');
                });
        }

        // Muestra el formulario con los datos del producto
        function mostrarFormulario() {
            if (mostrarDatosProducto) {
                document.getElementById('descripcionModificar').value = descripcion;
                document.getElementById('cantidadModificar').value = nombre_autor;

                const imagenActual = document.getElementById('imagen-actual');
                if (imagen && !imagenSeleccionada) { // Verifica si imagen_url no está vacía y no se ha seleccionado una imagen

                    imagenActual.src = './static/imagenes/' + imagen;                    
                    
                    //Al subir al servidor, deberá utilizarse la siguiente ruta. USUARIO debe ser reemplazado por el nombre de usuario de Pythonanywhere
                    //imagenActual.src = 'https://www.pythonanywhere.com/user/USUARIO/files/home/USUARIO/mysite/static/imagenes/' + imagen_url;

                    imagenActual.style.display = 'block'; // Muestra la imagen actual
                } else {
                    imagenActual.style.display = 'none'; // Oculta la imagen si no hay URL
                }

                document.getElementById('datos-producto').style.display = 'block';
            } else {
                document.getElementById('datos-producto').style.display = 'none';
            }
        }

        // Se activa cuando el usuario selecciona una imagen para cargar.
        function seleccionarImagen(event) {
            const file = event.target.files[0];
            imagenSeleccionada = file;
            imagenUrlTemp = URL.createObjectURL(file); // Crea una URL temporal para la vista previa

            const imagenVistaPrevia = document.getElementById('imagen-vista-previa');
            imagenVistaPrevia.src = imagenUrlTemp;
            imagenVistaPrevia.style.display = 'block';
        }

        // Se usa para enviar los datos modificados del producto al servidor.
        function guardarCambios(event) {
            event.preventDefault();

            const formData = new FormData();
            formData.append('codigo', codigo);
            formData.append('descripcion', document.getElementById('descripcionModificar').value);
            formData.append('nombre_autor', document.getElementById('cantidadModificar').value);
            
            // Si se ha seleccionado una imagen nueva, la añade al formData. 
            if (imagenSeleccionada) {
                formData.append('imagen', imagenSeleccionada, imagenSeleccionada.name);
            }

            fetch(URL + 'amigus/' + codigo, {
                method: 'PUT',
                body: formData,
            })
                .then(response => {
                    if (response.ok) {
                        return response.json()
                    } else {
                        throw new Error('Error al guardar los cambios del Amigurumi.')
                    }
                })
                .then(data => {
                    alert('Amigu actualizado correctamente.');
                    limpiarFormulario();
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('Error al actualizar el Amigurumi.');
                });
        }

        // Restablece todas las variables relacionadas con el formulario a sus valores iniciales, lo que efectivamente "limpia" el formulario.
        function limpiarFormulario() {
            document.getElementById('codigo').value = '';
            document.getElementById('descripcionModificar').value = '';
            document.getElementById('cantidadModificar').value = '';
            document.getElementById('nuevaImagen').value = '';

            // const imagenActual = document.getElementById('imagen-actual');
            // imagenActual.style.display = 'none';

            const imagenVistaPrevia = document.getElementById('imagen-vista-previa');
            imagenVistaPrevia.style.display = 'none';

            codigo = '';
            descripcion = '';
            nombre_autor = '';
            imagen = '';
            imagenSeleccionada = null;
            imagenUrlTemp = null;
            mostrarDatosProducto = false;

            document.getElementById('datos-producto').style.display = 'none';
        }