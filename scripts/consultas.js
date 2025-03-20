
//Esquema de validación Restaurants
{
  "$jsonSchema": {
    "bsonType": "object",  // Especifica que el documento debe ser un objeto
    "required": [
      "name",           // El nombre del restaurante es obligatorio
      "address",        // La dirección del restaurante es obligatoria
      "rating",         // La calificación del restaurante es obligatoria
      "type_of_food"    // El tipo de comida es obligatorio
    ],
    "properties": {
      "_id": {
        "bsonType": "objectId",  // El _id debe ser de tipo ObjectId
        "description": "ID único del restaurante"
      },
      "name": {
        "bsonType": "string",     // El nombre debe ser una cadena de texto
        "minLength": 1,           // El nombre no puede ser vacío
        "description": "El nombre del restaurante debe ser una cadena de texto no vacía"
      },
      "address": {
        "bsonType": "object",     // La dirección debe ser un objeto
        "required": ["street", "city", "postcode"],  // La dirección debe tener estos campos
        "properties": {
          "street": {
            "bsonType": "string",  // La calle debe ser una cadena de texto
            "minLength": 1,
            "description": "La calle debe ser una cadena de texto no vacía"
          },
          "city": {
            "bsonType": "string",  // La ciudad debe ser una cadena de texto
            "minLength": 1,
            "description": "La ciudad debe ser una cadena de texto no vacía"
          },
          "postcode": {
            "bsonType": "string",  // El código postal debe ser una cadena de texto
            "minLength": 1,
            "description": "El código postal debe ser una cadena de texto no vacía"
          }
        }
      },
      "rating": {
        "bsonType": "int",        // La calificación debe ser un número entero
        "minimum": 1,             // La calificación mínima es 1
        "maximum": 5,             // La calificación máxima es 5
        "description": "La calificación debe ser un número entre 1 y 5"
      },
      "type_of_food": {
        "bsonType": "string",     // El tipo de comida debe ser una cadena de texto
        "minLength": 1,           // El tipo de comida no puede estar vacío
        "description": "El tipo de comida debe ser una cadena de texto no vacía"
      },
      "url": {
        "bsonType": "string",     // El URL debe ser una cadena de texto
        "description": "El URL del restaurante debe ser una cadena de texto válida"
      }
    }
  }
}


//Esquema validaciín Inspections 
{
  "$jsonSchema": {
    "bsonType": "object",  // Especifica que el documento debe ser un objeto
    "required": [
      "restaurant_id",   // El ID del restaurante es obligatorio
      "date",             // La fecha de la inspección es obligatoria
      "result"            // El resultado de la inspección es obligatorio
    ],
    "properties": {
      "_id": {
        "bsonType": "objectId",  // El _id debe ser de tipo ObjectId
        "description": "ID único de la inspección"
      },
      "restaurant_id": {
        "bsonType": "objectId",  // El campo restaurant_id debe ser de tipo ObjectId
        "description": "ID de referencia al restaurante"
      },
      "date": {
        "bsonType": "date",  // La fecha debe ser de tipo fecha
        "description": "La fecha de la inspección debe ser un valor de tipo fecha"
      },
      "result": {
        "bsonType": "string",  // El resultado debe ser una cadena de texto
        "enum": ["Pass", "Violation Issued", "Fail"],  // Los valores posibles para el resultado
        "description": "El resultado de la inspección debe ser uno de los siguientes valores: 'Pass', 'Violation Issued' o 'Fail'"
      },
      "notes": {
        "bsonType": "string",  // Las notas pueden ser opcionales y deben ser una cadena de texto
        "description": "Notas adicionales sobre la inspección"
      }
    }
  }
}



//Consultas punto 2
use restaurants
db.restaurants.find({"type_of_food": "Chinese"})

db.inspections.find({"result":"Violation Issued"}).sort({"date":-1})
db.restaurants.find({"rating": {$gt:4}})

//Consultas punto 3
db.restaurants.aggregate([
   {
      $group: {
         _id: "$type_of_food", // Agrupación por tipo de comida
         avgRating: { $avg: "$rating" } // Calculo del promedio de calificación
      }
   },
   {
      $sort: { avgRating: -1 } // Ordena de mayor a menor la calificación promedio
   }
])

db.inspections.aggregate([
   {
      $group: {
         _id: "$result", // Agrupa por el campo 'result' (ej: "Pass", "Violation Issued")
         count: { $sum: 1 } // Cuenta cuántas inspecciones hay en cada resultado
      }
   },
   {
      $group: {
         _id: null, // Agrupa todo para calcular el total general
         total: { $sum: "$count" },
         results: { $push: { result: "$_id", count: "$count" } }
      }
   },
   {
      $unwind: "$results" // Descompone el array 'results'
   },
   {
      $project: {
         _id: 0,
         result: "$results.result",
         count: "$results.count",
         percentage: { $round: [{ $multiply: [{ $divide: ["$results.count", "$total"] }, 100] }, 2] } // Calcula el porcentaje
      }
   },
   {
      $sort: { count: -1 } // Ordena de mayor a menor cantidad de inspecciones
   }
])


db.restaurants.aggregate([
    {
        "$lookup": {
            "from": "inspections",
            "localField": "_id",
            "foreignField": "restaurant_id",
            "as": "inspection_history"
        }
    }
]);



