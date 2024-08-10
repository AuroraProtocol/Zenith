const colors = require('colors');
const figlet = require('figlet');

// Définir les couleurs pour chaque niveau de log
const logLevels = {
    error: colors.red,
    warn: colors.yellow,
    info: colors.green,
    debug: colors.green,

    command: colors.rainbow
};

// Couleurs spécifiques pour les commandes et les événements
const commandColor = colors.blue.bold;
const eventColor = colors.cyan;
const levelColor = colors.magenta;


const formatDate = (date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Les mois sont indexés à partir de 0
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
};


const log = (level, message) => {
    const formattedLevel = levelColor(`[${level.toUpperCase()}]`);
    const now = new Date();
    const formattedDate = formatDate(now);
    let formattedMessage = `${formattedDate} ${formattedLevel}: ${message}`;

    // Coloriser les messages pour les commandes
    if (message.includes('Loaded command')) {
        formattedMessage = formattedMessage.replace(
            /Loaded command \w+/,
            match => commandColor(match)
        );
    }
    // Coloriser les messages pour les événements
    else if (message.includes('Loaded event')) {
        formattedMessage = formattedMessage.replace(
            /Loaded event \w+/,
            match => eventColor(match)
        );
    }

    console.log(logLevels[level](formattedMessage));
};

const error = (message) => log('error', message);
const warn = (message) => log('warn', message);
const info = (message) => log('info', message);
const debug = (message) => log('debug', message);

const banner = (text) => {
    console.log(colors.yellow(figlet.textSync(text, { horizontalLayout: 'default' })));
};

module.exports = { error, warn, info, debug, banner };
