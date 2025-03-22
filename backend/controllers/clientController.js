// clientController.js
const { pool } = require('../app');

// Add a new client (only Admin or SuperAdmin can do this)
const addClient = async (req, res) => {
    const { client_name, phone_number, requirements, package, description } = req.body;

    console.log('Incoming request data for adding client:', req.body); // Log incoming request

    // Validate that the required fields are provided
    if (!client_name || !phone_number || !requirements || !package || !description) {
        console.log('Missing required fields:', {
            client_name,
            phone_number,
            requirements,
            package,
            description
        });
        return res.status(400).json({ message: 'Missing required fields' });
    }

    // Validate that the requirements field has valid numbers
    if (typeof requirements.reel !== 'number' || typeof requirements.video !== 'number' || typeof requirements.poster !== 'number') {
        console.log('Invalid requirements values:', requirements);
        return res.status(400).json({ message: 'Requirements should contain numeric values for reel, video, and poster' });
    }

    try {
        // Log the user role from auth middleware
        const { role } = req.user;
        console.log('Authenticated user role:', role);

        // Check if the user is an admin or superadmin
        if (role !== 'admin' && role !== 'superadmin') {
            console.log('Permission denied: User does not have the right role');
            return res.status(403).json({ message: 'Forbidden: You do not have permission to add a client.' });
        }

        // Insert the new client details into the database
        console.log('Attempting to insert client into database...');
        await pool.query(
            `INSERT INTO clients (client_name, phone_number, requirements, package, description) 
            VALUES ($1, $2, $3, $4, $5)`,
            [client_name, phone_number, JSON.stringify(requirements), package, description]
        );

        console.log('Client added successfully.');
        res.status(201).json({ message: 'Client added successfully.' });
    } catch (error) {
        // Log detailed error information
        console.error('Error adding client:', error.message);
        console.error('Error stack trace:', error.stack);

        // Return a generic error message to the client
        res.status(500).json({ message: 'Server error while adding client' });
    }
};


// Get all clients
const getAllClients = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM clients');
        res.status(200).json({ clients: result.rows });
    } catch (error) {
        console.error('Error fetching clients:', error);
        res.status(500).json({ message: 'Server error while fetching clients' });
    }
};

// Get a single client by ID
const getClientById = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query('SELECT * FROM clients WHERE id = $1', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Client not found' });
        }

        res.status(200).json({ client: result.rows[0] });
    } catch (error) {
        console.error('Error fetching client:', error);
        res.status(500).json({ message: 'Server error while fetching client details' });
    }
};

// Update client details
const updateClient = async (req, res) => {
    const { id } = req.params;
    const { client_name, phone_number, requirements, package, description } = req.body;

    try {
        // Validate if client exists
        const clientResult = await pool.query('SELECT * FROM clients WHERE id = $1', [id]);

        if (clientResult.rows.length === 0) {
            return res.status(404).json({ message: 'Client not found' });
        }

        // Update client details
        await pool.query(
            `UPDATE clients SET client_name = $1, phone_number = $2, requirements = $3, package = $4, description = $5 WHERE id = $6`,
            [client_name, phone_number, JSON.stringify(requirements), package, description, id]
        );

        res.status(200).json({ message: 'Client updated successfully' });
    } catch (error) {
        console.error('Error updating client:', error);
        res.status(500).json({ message: 'Server error while updating client' });
    }
};

// Delete a client (Only Admin or SuperAdmin)
const deleteClient = async (req, res) => {
    const { id } = req.params;

    try {
        // Check if the client exists
        const clientResult = await pool.query('SELECT * FROM clients WHERE id = $1', [id]);
        if (clientResult.rows.length === 0) {
            return res.status(404).json({ message: 'Client not found.' });
        }

        // Delete the client
        await pool.query('DELETE FROM clients WHERE id = $1', [id]);

        res.status(200).json({ message: 'Client deleted successfully.' });
    } catch (error) {
        console.error('Error deleting client:', error);
        res.status(500).json({ message: 'Server error while deleting client' });
    }
};

module.exports = { addClient, getAllClients, getClientById, updateClient, deleteClient };
