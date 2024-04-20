const express = require('express');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Ruta por defecto para servir el archivo HTML
app.get('/', async (req, res) => {
    try {
        const htmlContent = await fs.readFile(path.join(__dirname, 'index.html'), 'utf8');
        res.send(htmlContent);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Hubo un problema al procesar la solicitud.' });
    }
});

// Ruta para agregar un nuevo deporte
app.get('/agregar', async (req, res) => {
    try {
        const { nombre, precio } = req.query;

        // Validar los parámetros requeridos y el tipo adecuado
        if (!nombre || typeof nombre !== 'string') {
            return res.status(400).json({ error: 'El nombre es requerido y de ser un nombre válido' });
        }
        if (!precio || isNaN(parseFloat(precio))) {
            return res.status(400).json({ error: 'El precio es requerido y debe ser un número válido.' });
        }

        // Verificar si el archivo deportes.json existe, si no, crearlo
        try {
            await fs.access('deportes.json');
        } catch (error) {
            // Si el archivo no existe, crearlo con un array vacío
            await fs.writeFile('deportes.json', '[]');
            res.status(201).json({ message: 'El archivo deportes.json, donde se almacenan los deportes, no existía, por lo tanto, su deporte no pudo ser guardado. No obstante, ha sido creado exitosamente. Por favor, vuelva a agregar el deporte.' });
            return;
        }

        // Cargar los deportes actuales
        let deportes = await fs.readFile('deportes.json', 'utf8');
        deportes = JSON.parse(deportes);

        // Validar que no se repitan los nombres de los deportes
        if (deportes.find(deporte => deporte.nombre === nombre)) {
            return res.status(400).json({ error: 'El deporte ya existe.' });
        }

        // Agregar el nuevo deporte
        deportes.push({ nombre, precio: parseFloat(precio) });

        // Guardar los cambios en el archivo JSON
        await fs.writeFile('deportes.json', JSON.stringify(deportes, null, 2));

        res.status(200).json({ message: 'Deporte agregado exitosamente.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Hubo un problema al procesar la solicitud.' });
    }
});

// Ruta para obtener todos los deportes
app.get('/deportes', async (req, res) => {
    try {
        const deportes = await fs.readFile('deportes.json', 'utf8');
        res.status(200).json({ deportes: JSON.parse(deportes) });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Hubo un problema al procesar la solicitud.' });
    }
});

// Ruta para editar el precio de un deporte
app.get('/editar', async (req, res) => {
    try {
        const { nombre, precio } = req.query;

        // Verificar si el archivo deportes.json existe
        try {
            await fs.access('deportes.json');
        } catch (error) {
            return res.status(404).send('El archivo deportes.json no existe');
        }

        // Validar que se reciban los parámetros necesarios
        if (!nombre || typeof nombre !== 'string') {
            return res.status(400).json({ error: 'El nombre es requerido y debe ser un nombre válido.' });
        }
        if (!precio || isNaN(parseFloat(precio))) {
            return res.status(400).json({ error: 'El precio es requerido y debe ser un número válido.' });
        }

        // Cargar los deportes actuales
        let deportes = await fs.readFile('deportes.json', 'utf8');
        deportes = JSON.parse(deportes);

        // Encontrar y editar el deporte
        const index = deportes.findIndex(deporte => deporte.nombre === nombre);
        if (index !== -1) {
            deportes[index].precio = parseFloat(precio);
            await fs.writeFile('deportes.json', JSON.stringify(deportes, null, 2));
            return res.status(200).json({ message: 'Precio del deporte actualizado.' });
        } else {
            return res.status(404).json({ error: 'Deporte no encontrado.' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Hubo un problema al procesar la solicitud.' });
    }
});

// Ruta para eliminar un deporte
app.get('/eliminar/:nombre', async (req, res) => {
    try {
        const nombre = req.params.nombre;

        // Verificar si el archivo deportes.json existe
        try {
            await fs.access('deportes.json');
        } catch (error) {
            return res.status(404).send('El archivo deportes.json no existe');
        }

        // Cargar los deportes actuales
        let deportes = await fs.readFile('deportes.json', 'utf8');
        deportes = JSON.parse(deportes);

        // Encontrar y eliminar el deporte
        const filteredDeportes = deportes.filter(deporte => deporte.nombre !== nombre);
        if (filteredDeportes.length < deportes.length) {
            await fs.writeFile('deportes.json', JSON.stringify(filteredDeportes, null, 2));
            return res.status(200).json({ message: 'Deporte eliminado exitosamente.' });
        } else {
            return res.status(404).json({ error: 'Deporte no encontrado.' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Hubo un problema al procesar la solicitud.' });
    }
});

// Middleware para manejar rutas no existentes
app.use((req, res) => {
    res.status(404).json({ error: 'Ruta no encontrada.' });
});

app.listen(PORT, () => {
    console.log(`El servidor está funcionando en http://localhost:${PORT}`);
});
