export function applyEndpoints({app}) {
    app.get('/hello_world', (req, res) => {
        res.send('Hello World');
    });

    app.get('/hello_user', (req, res) => {
        res.send('Hello, ' + res.locals?.oauth?.token?.user?.username);
    });


}