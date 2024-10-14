async function getUsernamesFromIds(client, ids) {
    const users = await Promise.all(ids.map(id => client.users.fetch(id)));
    return users.map(user => user.username);  // Retourne uniquement les noms d'utilisateur en brut
}

module.exports = {
    getUsernamesFromIds
};