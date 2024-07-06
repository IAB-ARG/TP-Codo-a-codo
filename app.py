import mysql.connector

from flask import Flask, request, jsonify, render_template
from flask import request
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
import time

app = Flask(__name__)
CORS(app)  # Esto habilitará CORS para todas las rutas

class Baseamigus:
    
    def __init__(self, host, user, password, database):
        
        self.conn = mysql.connector.connect(
            host=host,
            user=user,
            password=password,
            database=database
        ) 
        self.conector = self.conn.cursor(dictionary=True)
        
        self.conector.execute('''CREATE TABLE IF NOT EXISTS amigus_nueva (
            codigo INT AUTO_INCREMENT PRIMARY KEY,
            descripcion VARCHAR(255),
            nombre_autor VARCHAR(16),
            imagen VARCHAR(255))''')
        self.conn.commit()

    def agregar_amigus(self, descripcion, nombre_autor, imagen):

        self.conector.execute(f"SELECT * FROM amigus_nueva WHERE nombre_autor = '{nombre_autor}'")
        producto_existe = self.conector.fetchone()
        if producto_existe:
            return False

        sql = f"INSERT INTO amigus_nueva \
               (descripcion, nombre_autor, imagen) \
               VALUES \
               ('{descripcion}', '{nombre_autor}', '{imagen}')"
        self.conector.execute(sql)
        self.conn.commit()
        return True
    
    def modificar_amigus(self, codigo, descripcion, nombre_autor, imagen):
        
        sql = f"UPDATE amigus_nueva SET descripcion = '{descripcion}', nombre_autor = '{nombre_autor}', imagen = '{imagen}' WHERE codigo = {codigo}" 
              
        self.conector.execute(sql)
        self.conn.commit()
        return self.conector.rowcount > 0

    def listar_amigus(self):
        
        self.conector.execute("SELECT * FROM amigus_nueva")
        amigus = self.conector.fetchall()
        return amigus
        

    def eliminar_amigu(self, codigo):
        
        self.conector.execute(f"DELETE FROM amigus_nueva WHERE codigo = {codigo}")
        self.conn.commit()
        return self.conector.rowcount > 0

    def consultar_amigu(self, codigo):
        
        self.conector.execute(f"SELECT * FROM amigus_nueva WHERE codigo = {codigo}")
        
        return self.conector.fetchone()  

    def mostrar_amigu(self, codigo):
        
        amigu = self.consultar_amigu(codigo)
        if amigu:
            print("-" * 40)
            print(f"Código.....: {amigu['codigo']}")
            print(f"Descripción: {amigu['descripcion']}")
            print(f"Nombre autor: {amigu['nombre_autor']}")
            print("-" * 40)
        else:
            print("Amigu no encontrado.")

baseamigus = Baseamigus (host='braccoi.mysql.pythonanywhere-services.com', user='braccoi', password='Chaco104', database='braccoi$amigurumis')

RUTA_DESTINO = '/home/braccoi/mysite/static/imagenes/'


#--------------------------------------------------------------------
# Agregar un Amigurumi
#--------------------------------------------------------------------
@app.route("/amigus", methods=["POST"])

def agregar_producto():

    descripcion = request.form['descripcion']
    nombre_autor = request.form['nombre_autor']
    imagen = request.files['imagen']
    '''precio = request.form['precio']
    imagen = request.files['imagen']
    proveedor = request.form['proveedor']  
    nombre_imagen=""
'''
# Tratamiento de imagen
    nombre_imagen = secure_filename(imagen.filename) 
    nombre_base, extension = os.path.splitext(nombre_imagen) 
    nombre_imagen = f"{nombre_base}_{int(time.time())}{extension}" 


    nuevo_codigo = baseamigus.agregar_amigus(descripcion, nombre_autor, nombre_imagen)
    if nuevo_codigo:
        imagen.save(os.path.join(RUTA_DESTINO, nombre_imagen))
        return jsonify({"mensaje": "Amigurumi agregado correctamente.", "codigo": nuevo_codigo}), 201
    else:
        return jsonify({"mensaje": "Error al agregar el Amigurumi."}), 500

#--------------------------------------------------------------------
# Listar todos los Amigurumis
#--------------------------------------------------------------------
@app.route("/amigus", methods=["GET"])
def listar_productos():
    productos = baseamigus.listar_amigus()
    return jsonify(productos)

#--------------------------------------------------------------------
# Mostrar un sólo Amigurumi según su código
#--------------------------------------------------------------------

@app.route("/amigus/<int:codigo>", methods=["GET"])
def mostrar_producto(codigo):
    producto = baseamigus.consultar_amigu(codigo)
    if producto:
        return jsonify(producto), 201
    else:
        return "Amigurumi no encontrado", 404

#--------------------------------------------------------------------
# Eliminar un Amigurumi según su código
#--------------------------------------------------------------------
@app.route("/amigus/<int:codigo>", methods=["DELETE"])

def eliminar_producto(codigo):
    producto = baseamigus.consultar_amigu(codigo)
    if producto: 
        imagen_vieja = producto["imagen"]
        ruta_imagen = os.path.join(RUTA_DESTINO, imagen_vieja)

        if os.path.exists(ruta_imagen):
            os.remove(ruta_imagen)

        if baseamigus.eliminar_amigu(codigo):
            return jsonify({"mensaje": "Amigurumi eliminado"}), 200
        else:
            return jsonify({"mensaje": "Error al eliminar el Amigurumi"}), 500
    else: 
        return jsonify({"mensaje": "Amigurumi no encontrado"}), 404

#--------------------------------------------------------------------
# Modificar un Amigurumi según su código
#--------------------------------------------------------------------
@app.route("/amigus/<int:codigo>", methods=["PUT"])

def modificar_producto(codigo):
    
    nueva_descripcion = request.form.get("descripcion")
    nueva_nombre_autor = request.form.get("nombre_autor")
    
    if 'imagen' in request.files:
        imagen = request.files['imagen']
        
        nombre_imagen = secure_filename(imagen.filename) 
        nombre_base, extension = os.path.splitext(nombre_imagen) 
        nombre_imagen = f"{nombre_base}_{int(time.time())}{extension}" 

        
        imagen.save(os.path.join(RUTA_DESTINO, nombre_imagen))
        
        
        producto = baseamigus.consultar_amigu(codigo)
        if producto: 
            imagen_vieja = producto["imagen"]
            
            ruta_imagen = os.path.join(RUTA_DESTINO, imagen_vieja)

            
            if os.path.exists(ruta_imagen):
                os.remove(ruta_imagen)
    
    else:
        
        producto = baseamigus.consultar_amigu(codigo)
        if producto:
            nombre_imagen = producto["imagen"]


    
    if baseamigus.modificar_amigus(codigo, nueva_descripcion, nueva_nombre_autor, nombre_imagen):
        
        return jsonify({"mensaje": "Amigurumi modificado"}), 200
    else:
        
        return jsonify({"mensaje": "Amigurumi no encontrado"}), 404

if __name__ == "__main__":
    app.run(debug=True)

