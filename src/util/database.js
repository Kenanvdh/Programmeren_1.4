let database = {
    users: [
        {
            id: 0,
            firstname: 'Kenan',
            lastname: 'van der Heijden',
            email: 'kenanvdh@ziggo.nl',
            password: 'Welkom01!',
            phoneNumber: '0642108889',
            active: true
        },
        {
            id: 1,
            firstname: 'John',
            lastname: 'Doe',
            email: 'Johndoe@gmail.com',
            password: 'Welkom02!',
            phoneNumber: '0611111111',
            active: true
        },
        {
            id: 2,
            firstname: 'Jane',
            lastname: 'Doe',
            email: 'Janedoe@gmail.com',
            password: 'Welkom03!',
            phoneNumber: '0623456789',
            active: false
        }
    ],
    //autoincrement id
    index: 3

};

module.exports = database;
// module.exports = database.index;