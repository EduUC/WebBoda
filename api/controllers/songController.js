const supabase = require('../services/supabaseClient');

const addSong = async (req, res) => {
    try {
        const { title, artist, genre, songId } = req.body;
        const { data, error } = await supabase
            .from('songs')
            .insert([{ title, artist, genre, songId }]);

        if (error) throw error;
        res.status(201).json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getSongs = async (req, res) => {
    try {
        const { data, error } = await supabase.from('songs').select('*');
        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { addSong, getSongs };
