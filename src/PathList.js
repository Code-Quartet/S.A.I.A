const path = require('path');
const { app } = require('electron');

const isPackaged = app.isPackaged;

const PathList = {
    dbPath:isPackaged 
        ? path.join(__dirname, '../../database/SAIA.db')
        : path.join(__dirname, '../database/SAIA.db'),
    
    configPath: isPackaged
        ? path.join(__dirname, '../../database/.config.json')
        : path.join(__dirname, '../database/.config.json'),
};

module.exports = PathList;