const { Client } = require('../models'); // Import Sequelize model

// Add a new client (Only Admin or SuperAdmin)
const addClient = async (req, res) => {
    try {
        const { client_name, phone_number, requirements, package, description } = req.body;

        if (!client_name || !phone_number || !requirements || !package || !description) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        if (typeof requirements.reel !== 'number' || typeof requirements.video !== 'number' || typeof requirements.poster !== 'number') {
            return res.status(400).json({ message: 'Requirements should contain numeric values for reel, video, and poster' });
        }

        const { role } = req.user; // User role from authentication middleware

        if (role !== 'admin' && role !== 'superadmin') {
            return res.status(403).json({ message: 'Forbidden: You do not have permission to add a client.' });
        }

        await Client.create({
            client_name,
            phone_number,
            requirements,
            package,
            description
        });

        res.status(201).json({ message: 'Client added successfully.' });
    } catch (error) {
        console.error('Error adding client:', error);
        res.status(500).json({ message: 'Server error while adding client' });
    }
};

// Get all clients
const getAllClients = async (req, res) => {
    try {
        const clients = await Client.findAll(); // Fetch all clients
        res.status(200).json({ clients });
    } catch (error) {
        console.error('Error fetching clients:', error);
        res.status(500).json({ message: 'Server error while fetching clients' });
    }
};

// Get a single client by ID
const getClientById = async (req, res) => {
    try {
        const { id } = req.params;
        const client = await Client.findByPk(id); // Find by primary key

        if (!client) {
            return res.status(404).json({ message: 'Client not found' });
        }

        res.status(200).json({ client });
    } catch (error) {
        console.error('Error fetching client:', error);
        res.status(500).json({ message: 'Server error while fetching client details' });
    }
};

// Update client details
const updateClient = async (req, res) => {
    try {
        const { id } = req.params;
        const { client_name, phone_number, requirements, package, description } = req.body;

        const client = await Client.findByPk(id);
        if (!client) {
            return res.status(404).json({ message: 'Client not found' });
        }

        await client.update({
            client_name,
            phone_number,
            requirements,
            package,
            description
        });

        res.status(200).json({ message: 'Client updated successfully' });
    } catch (error) {
        console.error('Error updating client:', error);
        res.status(500).json({ message: 'Server error while updating client' });
    }
};

// Delete a client (Only Admin or SuperAdmin)
const deleteClient = async (req, res) => {
    try {
        const { id } = req.params;
        const client = await Client.findByPk(id);

        if (!client) {
            return res.status(404).json({ message: 'Client not found' });
        }

        await client.destroy(); // Delete client
        res.status(200).json({ message: 'Client deleted successfully.' });
    } catch (error) {
        console.error('Error deleting client:', error);
        res.status(500).json({ message: 'Server error while deleting client' });
    }
};

module.exports = { addClient, getAllClients, getClientById, updateClient, deleteClient };
